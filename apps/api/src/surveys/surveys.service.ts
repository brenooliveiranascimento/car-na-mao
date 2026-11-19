import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { InvalidSurveyError, surveyToPolygonWkt } from './survey-geometry';

interface AnalysisRow {
  survey_id: string;
  property_id: string;
  declared_area_ha: string;
  surveyed_area_ha: string;
  surveyed_outside_declared_ha: string;
  declared_outside_surveyed_ha: string;
  declared_geojson: string;
  surveyed_geojson: string;
  accuracy_avg_m: string | null;
}

interface OverlapRow {
  neighbour_id: string;
  car_code: string;
  name: string;
  declared_overlap_ha: string;
  surveyed_overlap_ha: string;
  declared_overlap_geojson: string | null;
}

/** Overlaps smaller than this are within normal GPS/drawing noise and are not reported. */
const MIN_OVERLAP_HA = 0.01;

@Injectable()
export class SurveysService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateSurveyDto) {
    let polygon: ReturnType<typeof surveyToPolygonWkt>;
    try {
      polygon = surveyToPolygonWkt(dto.points);
    } catch (error) {
      if (error instanceof InvalidSurveyError) throw new BadRequestException(error.message);
      throw error;
    }
    const property = await this.db.one<{ id: string }>('SELECT id FROM properties WHERE id = $1', [dto.propertyId]);
    if (!property) throw new NotFoundException('Imóvel não encontrado');

    // ST_MakeValid + ST_CollectionExtract repairs self-crossing walks (common when the
    // producer goes back and forth along a fence) and keeps only the largest polygon.
    const row = await this.db.one<{ id: string }>(
      `INSERT INTO field_surveys (property_id, client_id, points, surveyed_area, accuracy_avg_m, collected_at)
       VALUES ($1, $2, $3, (
         SELECT g FROM (
           SELECT (ST_Dump(ST_CollectionExtract(ST_MakeValid(ST_GeomFromText($4, 4674)), 3))).geom AS g
         ) parts ORDER BY ST_Area(g) DESC LIMIT 1
       ), $5, $6)
       ON CONFLICT (client_id) DO UPDATE SET client_id = EXCLUDED.client_id
       RETURNING id`,
      [dto.propertyId, dto.clientId, JSON.stringify(polygon.usedPoints), polygon.wkt, polygon.accuracyAvg, dto.collectedAt],
    );
    if (!row) throw new BadRequestException('Não foi possível formar uma área com os pontos coletados.');
    return this.analysis(row.id);
  }

  /**
   * Compares what the producer walked with what is declared in the CAR and with every
   * neighbour that touches either shape. All math runs in PostGIS.
   */
  async analysis(surveyId: string) {
    const base = await this.db.one<AnalysisRow>(
      `SELECT s.id AS survey_id, p.id AS property_id,
              area_ha(p.declared_area) AS declared_area_ha,
              area_ha(s.surveyed_area) AS surveyed_area_ha,
              area_ha(ST_Difference(s.surveyed_area, p.declared_area)) AS surveyed_outside_declared_ha,
              area_ha(ST_Difference(p.declared_area, s.surveyed_area)) AS declared_outside_surveyed_ha,
              ST_AsGeoJSON(p.declared_area, 7) AS declared_geojson,
              ST_AsGeoJSON(s.surveyed_area, 7) AS surveyed_geojson,
              s.accuracy_avg_m
         FROM field_surveys s JOIN properties p ON p.id = s.property_id
        WHERE s.id = $1`,
      [surveyId],
    );
    if (!base) throw new NotFoundException('Coleta não encontrada');

    const overlaps = await this.db.query<OverlapRow>(
      `SELECT n.id AS neighbour_id, n.car_code, n.name,
              area_ha(ST_Intersection(n.declared_area, p.declared_area)) AS declared_overlap_ha,
              area_ha(ST_Intersection(n.declared_area, s.surveyed_area)) AS surveyed_overlap_ha,
              ST_AsGeoJSON(ST_Intersection(n.declared_area, p.declared_area), 7) AS declared_overlap_geojson
         FROM field_surveys s
         JOIN properties p ON p.id = s.property_id
         JOIN properties n ON n.id <> p.id
                          AND (ST_Intersects(n.declared_area, p.declared_area) OR ST_Intersects(n.declared_area, s.surveyed_area))
        WHERE s.id = $1`,
      [surveyId],
    );

    const neighbours = overlaps
      .map((o) => ({
        propertyId: o.neighbour_id,
        carCode: o.car_code,
        name: o.name,
        declaredOverlapHa: Number(o.declared_overlap_ha),
        surveyedOverlapHa: Number(o.surveyed_overlap_ha),
        declaredOverlap: o.declared_overlap_geojson ? (JSON.parse(o.declared_overlap_geojson) as unknown) : null,
      }))
      .filter((o) => o.declaredOverlapHa >= MIN_OVERLAP_HA || o.surveyedOverlapHa >= MIN_OVERLAP_HA)
      .map((o) => ({ ...o, suggestion: suggest(o.declaredOverlapHa, o.surveyedOverlapHa) }));

    return {
      surveyId: base.survey_id,
      propertyId: base.property_id,
      declaredAreaHa: Number(base.declared_area_ha),
      surveyedAreaHa: Number(base.surveyed_area_ha),
      surveyedOutsideDeclaredHa: Number(base.surveyed_outside_declared_ha),
      declaredOutsideSurveyedHa: Number(base.declared_outside_surveyed_ha),
      accuracyAvgM: base.accuracy_avg_m == null ? null : Number(base.accuracy_avg_m),
      declaredArea: JSON.parse(base.declared_geojson) as unknown,
      surveyedArea: JSON.parse(base.surveyed_geojson) as unknown,
      neighbours,
    };
  }
}

/**
 * Plain-language hint. It never decides: it only says what the field data suggests,
 * so the producer can choose between correcting the map and contesting with documents.
 */
function suggest(declaredOverlapHa: number, surveyedOverlapHa: number): 'correct_boundary' | 'gather_documents' | 'talk_to_neighbour' {
  if (declaredOverlapHa >= MIN_OVERLAP_HA && surveyedOverlapHa < MIN_OVERLAP_HA) return 'correct_boundary';
  if (surveyedOverlapHa >= MIN_OVERLAP_HA && declaredOverlapHa >= MIN_OVERLAP_HA) return 'gather_documents';
  return 'talk_to_neighbour';
}

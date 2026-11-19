import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface PropertyRow {
  id: string;
  car_code: string;
  name: string;
  municipality: string;
  state: string;
  owner_name: string;
  fiscal_modules: string | null;
  declared_area_ha: string;
  declared_area_geojson: string;
}

@Injectable()
export class PropertiesService {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string) {
    const row = await this.db.one<PropertyRow>(
      `SELECT id, car_code, name, municipality, state, owner_name, fiscal_modules,
              area_ha(declared_area) AS declared_area_ha,
              ST_AsGeoJSON(declared_area, 7) AS declared_area_geojson
         FROM properties WHERE id = $1`,
      [id],
    );
    if (!row) throw new NotFoundException('Imóvel não encontrado');
    return {
      id: row.id,
      carCode: row.car_code,
      name: row.name,
      municipality: row.municipality,
      state: row.state,
      ownerName: row.owner_name,
      fiscalModules: row.fiscal_modules == null ? null : Number(row.fiscal_modules),
      declaredAreaHa: Number(row.declared_area_ha),
      declaredArea: JSON.parse(row.declared_area_geojson) as unknown,
    };
  }

  /** Demo shortcut until gov.br login exists: the first seeded property. */
  async findDemo() {
    const row = await this.db.one<{ id: string }>(`SELECT id FROM properties WHERE car_code LIKE '%DEMO%0001'`);
    if (!row) throw new NotFoundException('Rode o seed para criar o imóvel de demonstração');
    return this.findById(row.id);
  }
}

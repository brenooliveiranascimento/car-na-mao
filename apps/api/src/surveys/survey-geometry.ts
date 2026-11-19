export interface SurveyPoint {
  latitude: number;
  longitude: number;
  /** Horizontal accuracy reported by the phone, in metres. */
  accuracy: number | null;
  timestamp: number;
}

/** Points worse than this are ignored: phone GPS in open field is usually 3–10 m. */
export const MAX_ACCURACY_M = 25;
export const MIN_POINTS = 4;

export class InvalidSurveyError extends Error {}

/**
 * Turns the walked path into a closed polygon (WKT, lng lat order).
 * The polygon is validated again by PostGIS (ST_MakeValid) before any area math.
 */
export function surveyToPolygonWkt(points: SurveyPoint[]): { wkt: string; usedPoints: SurveyPoint[]; accuracyAvg: number | null } {
  const used = points
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude))
    .filter((p) => p.accuracy == null || p.accuracy <= MAX_ACCURACY_M)
    .sort((a, b) => a.timestamp - b.timestamp);
  if (used.length < MIN_POINTS) {
    throw new InvalidSurveyError(`São necessários pelo menos ${MIN_POINTS} pontos com boa precisão de GPS (recebidos: ${used.length}).`);
  }
  const ring = used.map((p) => `${p.longitude} ${p.latitude}`);
  if (ring[0] !== ring[ring.length - 1]) ring.push(ring[0]);
  const accuracies = used.map((p) => p.accuracy).filter((a): a is number => a != null);
  const accuracyAvg = accuracies.length ? accuracies.reduce((s, a) => s + a, 0) / accuracies.length : null;
  return { wkt: `POLYGON((${ring.join(',')}))`, usedPoints: used, accuracyAvg };
}

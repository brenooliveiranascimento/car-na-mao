import type { GeoJsonPolygon } from './types';

type Ring = [number, number][];

/** Outer rings of a Polygon/MultiPolygon as [lng, lat] pairs. */
export function outerRings(geometry: GeoJsonPolygon | null | undefined): Ring[] {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [(geometry.coordinates as number[][][])[0] as Ring];
  return (geometry.coordinates as number[][][][]).map((polygon) => polygon[0] as Ring);
}

/**
 * Projects lng/lat rings into an SVG viewBox using a local equirectangular projection,
 * accurate enough to draw a single rural property. No map tiles: works fully offline.
 */
export function toSvgPaths(groups: Ring[][], size: number, padding = 12) {
  const all = groups.flat(2) as unknown as [number, number][];
  const points = groups.flat().flat() as [number, number][];
  if (points.length === 0 || all.length === 0) return groups.map(() => '');
  const meanLat = points.reduce((s, [, lat]) => s + lat, 0) / points.length;
  const kx = Math.cos((meanLat * Math.PI) / 180);
  const xs = points.map(([lng]) => lng * kx);
  const ys = points.map(([, lat]) => lat);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const scale = (size - padding * 2) / span;
  const project = ([lng, lat]: [number, number]) => [padding + (lng * kx - minX) * scale, padding + (maxY - lat) * scale] as const;
  return groups.map((rings) =>
    rings.map((ring) => ring.map((point, i) => `${i === 0 ? 'M' : 'L'}${project(point).map((n) => n.toFixed(1)).join(',')}`).join(' ') + ' Z').join(' '),
  );
}

/** Rough area (ha) of the walked path, shown live while recording. */
export function approximateAreaHa(points: { latitude: number; longitude: number }[]): number {
  if (points.length < 3) return 0;
  const meanLat = points.reduce((s, p) => s + p.latitude, 0) / points.length;
  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos((meanLat * Math.PI) / 180);
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.longitude * mPerDegLng * (b.latitude * mPerDegLat) - b.longitude * mPerDegLng * (a.latitude * mPerDegLat);
  }
  return Math.abs(sum) / 2 / 10_000;
}

export const formatHa = (ha: number) => `${ha.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ha`;

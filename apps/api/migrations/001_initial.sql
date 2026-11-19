-- Coordinates use SIRGAS 2000 (EPSG:4674), the official geodetic reference system in Brazil.
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE properties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_code        text NOT NULL UNIQUE,
  name            text NOT NULL,
  municipality    text NOT NULL,
  state           char(2) NOT NULL,
  owner_name      text NOT NULL,
  fiscal_modules  numeric(6, 2),
  declared_area   geometry(MultiPolygon, 4674) NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX properties_declared_area_gix ON properties USING gist (declared_area);

CREATE TABLE notifications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    uuid NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  external_code  text NOT NULL,
  issued_by      text NOT NULL,
  issued_at      date NOT NULL,
  due_date       date,
  kind           text NOT NULL CHECK (kind IN ('overlap', 'legal_reserve', 'permanent_preservation', 'documents', 'dynamic_rectification', 'other')),
  original_text  text NOT NULL,
  status         text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'answered')),
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_property_idx ON notifications (property_id);

-- Explanations are cached by the hash of the notification text: identical notices
-- (very common across properties) reuse the same answer and cost nothing extra.
CREATE TABLE ai_explanations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash  text NOT NULL UNIQUE,
  provider      text NOT NULL,
  model         text NOT NULL,
  explanation   jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE field_surveys (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    uuid NOT NULL REFERENCES properties (id) ON DELETE CASCADE,
  client_id      text NOT NULL UNIQUE, -- generated on the phone; makes offline sync idempotent
  points         jsonb NOT NULL,
  surveyed_area  geometry(Polygon, 4674) NOT NULL,
  accuracy_avg_m numeric(8, 2),
  collected_at   timestamptz NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX field_surveys_area_gix ON field_surveys USING gist (surveyed_area);

-- Geodesic area in hectares (SIRGAS 2000 is compatible with WGS 84 at this precision).
CREATE FUNCTION area_ha(g geometry) RETURNS numeric
LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT round((ST_Area(ST_Transform(g, 4326)::geography) / 10000)::numeric, 4)
$$;

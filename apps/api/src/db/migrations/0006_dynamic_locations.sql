-- Migration: Dynamic Locations with Nominatim Integration
-- This migration extends the locations table to support dynamic location activation
-- and adds fields needed for Nominatim integration.

-- 1. Add new columns to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS osm_type VARCHAR(20) DEFAULT 'relation';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS content_count INTEGER DEFAULT 0;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS nominatim_updated_at TIMESTAMPTZ;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS population INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS name_fi VARCHAR(255);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS name_sv VARCHAR(255);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);

-- 2. Create text search index for location names (hybrid search)
CREATE INDEX IF NOT EXISTS locations_name_search_idx
  ON locations USING gin(to_tsvector('simple', name));

-- 3. Create index for status filtering
CREATE INDEX IF NOT EXISTS locations_status_idx ON locations(status);

-- 4. Create index for content_count sorting
CREATE INDEX IF NOT EXISTS locations_content_count_idx ON locations(content_count DESC);

-- 5. Create composite index for name + country searches
CREATE INDEX IF NOT EXISTS locations_name_country_idx ON locations(name, country);

-- 6. Add comment for documentation
COMMENT ON COLUMN locations.osm_type IS 'OSM element type: node, way, or relation';
COMMENT ON COLUMN locations.status IS 'active = has content, cached = fetched but no content yet';
COMMENT ON COLUMN locations.content_count IS 'Number of threads, clubs, etc. linked to this location';
COMMENT ON COLUMN locations.nominatim_updated_at IS 'Last time location data was refreshed from Nominatim';
COMMENT ON COLUMN locations.population IS 'Population from OSM/Nominatim data';
COMMENT ON COLUMN locations.name_fi IS 'Finnish name variant';
COMMENT ON COLUMN locations.name_sv IS 'Swedish name variant';
COMMENT ON COLUMN locations.name_en IS 'English name variant';

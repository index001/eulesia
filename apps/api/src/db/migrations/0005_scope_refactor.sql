-- Migration: Refactor scope enum from municipal/regional/national to local/national/european
-- This better reflects European administrative hierarchy

-- Step 1: Create new enum type
CREATE TYPE scope_new AS ENUM ('local', 'national', 'european');

-- Step 2: Add temporary column with new type
ALTER TABLE threads ADD COLUMN scope_new scope_new;

-- Step 3: Migrate data
-- municipal → local (local discussions about municipalities, villages, regions)
-- regional → local (regional is now part of local)
-- national → national (stays the same)
UPDATE threads SET scope_new = 'local' WHERE scope = 'municipal';
UPDATE threads SET scope_new = 'local' WHERE scope = 'regional';
UPDATE threads SET scope_new = 'national' WHERE scope = 'national';

-- Step 4: Set default for any NULL values
UPDATE threads SET scope_new = 'local' WHERE scope_new IS NULL;

-- Step 5: Make column not null
ALTER TABLE threads ALTER COLUMN scope_new SET NOT NULL;

-- Step 6: Drop old column and rename new one
ALTER TABLE threads DROP COLUMN scope;
ALTER TABLE threads RENAME COLUMN scope_new TO scope;

-- Step 7: Drop old enum type and rename new one
DROP TYPE scope;
ALTER TYPE scope_new RENAME TO scope;

-- Step 8: Add country field to threads for national-level filtering
ALTER TABLE threads ADD COLUMN country VARCHAR(2) DEFAULT 'FI';

-- Update existing threads to have country based on municipality
UPDATE threads t
SET country = m.country
FROM municipalities m
WHERE t.municipality_id = m.id AND t.country IS NULL;

-- Set default for threads without municipality
UPDATE threads SET country = 'FI' WHERE country IS NULL;

-- Run this script in Supabase SQL Editor to update vector dimensions from 512 to 384
-- This fixes the "expected 512 dimensions, not 384" error

-- Step 1: Drop existing functions that use the old dimension
DROP FUNCTION IF EXISTS search_similar_found_items(vector(512), float, int);
DROP FUNCTION IF EXISTS search_similar_lost_items(vector(512), float, int);
DROP FUNCTION IF EXISTS find_matches_for_lost_item(uuid, float, int);
DROP FUNCTION IF EXISTS find_matches_for_found_item(uuid, float, int);

-- Step 2: Clear existing embeddings (incompatible with new dimension)
UPDATE lost_reports SET image_emb = NULL WHERE image_emb IS NOT NULL;
UPDATE found_reports SET image_emb = NULL WHERE image_emb IS NOT NULL;

-- Step 3: Drop existing indexes
DROP INDEX IF EXISTS idx_lost_reports_image_emb;
DROP INDEX IF EXISTS idx_found_reports_image_emb;

-- Step 4: Alter columns to new 384 dimension
ALTER TABLE lost_reports 
ALTER COLUMN image_emb TYPE vector(384);

ALTER TABLE found_reports 
ALTER COLUMN image_emb TYPE vector(384);

-- Step 5: Recreate indexes with new dimension
CREATE INDEX idx_lost_reports_image_emb 
ON lost_reports USING ivfflat (image_emb vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX idx_found_reports_image_emb 
ON found_reports USING ivfflat (image_emb vector_cosine_ops) 
WITH (lists = 100);

-- Step 6: Create updated functions with 384 dimensions

-- Function to find matching found items for a lost item
CREATE OR REPLACE FUNCTION find_matches_for_lost_item(
  lost_report_id uuid,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  description text,
  location_found text,
  image_url text,
  found_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_embedding vector(384);
BEGIN
  -- Get the embedding from the lost report
  SELECT image_emb INTO query_embedding
  FROM lost_reports
  WHERE lost_reports.id = lost_report_id;
  
  IF query_embedding IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT
    f.id,
    f.title,
    f.category,
    f.description,
    f.location_found,
    f.image_url,
    f.found_at,
    (1 - (f.image_emb <=> query_embedding))::float AS similarity
  FROM found_reports f
  WHERE f.image_emb IS NOT NULL
    AND f.status = 'active'
    AND 1 - (f.image_emb <=> query_embedding) > match_threshold
  ORDER BY f.image_emb <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to find matching lost items for a found item
CREATE OR REPLACE FUNCTION find_matches_for_found_item(
  found_report_id uuid,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  description text,
  last_seen text,
  image_url text,
  lost_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_embedding vector(384);
BEGIN
  -- Get the embedding from the found report
  SELECT image_emb INTO query_embedding
  FROM found_reports
  WHERE found_reports.id = found_report_id;
  
  IF query_embedding IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.category,
    l.description,
    l.last_seen,
    l.image_url,
    l.lost_at,
    (1 - (l.image_emb <=> query_embedding))::float AS similarity
  FROM lost_reports l
  WHERE l.image_emb IS NOT NULL
    AND l.status = 'active'
    AND 1 - (l.image_emb <=> query_embedding) > match_threshold
  ORDER BY l.image_emb <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION find_matches_for_lost_item(uuid, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION find_matches_for_found_item(uuid, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION find_matches_for_lost_item(uuid, float, int) TO anon;
GRANT EXECUTE ON FUNCTION find_matches_for_found_item(uuid, float, int) TO anon;

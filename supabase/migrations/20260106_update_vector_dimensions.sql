-- Update vector dimensions from 512 to 384
-- This matches the embedding dimension produced by the updated edge function

-- First, clear existing embeddings (they're incompatible with the new dimension)
UPDATE lost_reports SET image_emb = NULL WHERE image_emb IS NOT NULL;
UPDATE found_reports SET image_emb = NULL WHERE image_emb IS NOT NULL;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_lost_reports_image_emb;
DROP INDEX IF EXISTS idx_found_reports_image_emb;

-- Alter columns to new dimension
ALTER TABLE lost_reports 
ALTER COLUMN image_emb TYPE vector(384);

ALTER TABLE found_reports 
ALTER COLUMN image_emb TYPE vector(384);

-- Recreate indexes with new dimension
CREATE INDEX idx_lost_reports_image_emb 
ON lost_reports USING ivfflat (image_emb vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX idx_found_reports_image_emb 
ON found_reports USING ivfflat (image_emb vector_cosine_ops) 
WITH (lists = 100);

-- Update the match functions to use 384 dimensions
CREATE OR REPLACE FUNCTION match_found_items(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  image_url text,
  category text,
  location_found text,
  found_at timestamptz,
  contact_preference text,
  contact_value text,
  reporter_name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fr.id,
    fr.title,
    fr.description,
    fr.image_url,
    fr.category,
    fr.location_found,
    fr.found_at,
    fr.contact_preference,
    fr.contact_value,
    fr.reporter_name,
    1 - (fr.image_emb <=> query_embedding) AS similarity
  FROM found_reports fr
  WHERE fr.image_emb IS NOT NULL
    AND 1 - (fr.image_emb <=> query_embedding) > match_threshold
  ORDER BY fr.image_emb <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION match_lost_items(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  image_url text,
  category text,
  last_seen text,
  lost_at timestamptz,
  contact_preference text,
  contact_value text,
  reporter_name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lr.id,
    lr.title,
    lr.description,
    lr.image_url,
    lr.category,
    lr.last_seen,
    lr.lost_at,
    lr.contact_preference,
    lr.contact_value,
    lr.reporter_name,
    1 - (lr.image_emb <=> query_embedding) AS similarity
  FROM lost_reports lr
  WHERE lr.image_emb IS NOT NULL
    AND 1 - (lr.image_emb <=> query_embedding) > match_threshold
  ORDER BY lr.image_emb <=> query_embedding
  LIMIT match_count;
END;
$$;

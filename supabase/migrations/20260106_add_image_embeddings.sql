-- Migration: Add image embedding column and similarity search function
-- This enables CLIP ViT-B-32 image embeddings for lost/found item matching

-- Enable the pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Add image_emb column to lost_reports table (512 dimensions for CLIP ViT-B-32)
ALTER TABLE lost_reports 
ADD COLUMN IF NOT EXISTS image_emb vector(512);

-- Add image_emb column to found_reports table (512 dimensions for CLIP ViT-B-32)
ALTER TABLE found_reports 
ADD COLUMN IF NOT EXISTS image_emb vector(512);

-- Create index for faster similarity search on lost_reports
CREATE INDEX IF NOT EXISTS idx_lost_reports_image_emb 
ON lost_reports 
USING ivfflat (image_emb vector_cosine_ops)
WITH (lists = 100);

-- Create index for faster similarity search on found_reports
CREATE INDEX IF NOT EXISTS idx_found_reports_image_emb 
ON found_reports 
USING ivfflat (image_emb vector_cosine_ops)
WITH (lists = 100);

-- Function to search for similar found items given a lost item's embedding
CREATE OR REPLACE FUNCTION search_similar_found_items(
  query_embedding vector(512),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  title text,
  category text,
  description text,
  location_found text,
  image_url text,
  found_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.title,
    f.category,
    f.description,
    f.location_found,
    f.image_url,
    f.found_at,
    1 - (f.image_emb <=> query_embedding) AS similarity
  FROM found_reports f
  WHERE f.image_emb IS NOT NULL
    AND f.status = 'active'
    AND 1 - (f.image_emb <=> query_embedding) > match_threshold
  ORDER BY f.image_emb <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search for similar lost items given a found item's embedding
CREATE OR REPLACE FUNCTION search_similar_lost_items(
  query_embedding vector(512),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  title text,
  category text,
  description text,
  last_seen text,
  image_url text,
  lost_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.category,
    l.description,
    l.last_seen,
    l.image_url,
    l.lost_at,
    1 - (l.image_emb <=> query_embedding) AS similarity
  FROM lost_reports l
  WHERE l.image_emb IS NOT NULL
    AND l.status = 'active'
    AND 1 - (l.image_emb <=> query_embedding) > match_threshold
  ORDER BY l.image_emb <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to find potential matches for a specific lost report
CREATE OR REPLACE FUNCTION find_matches_for_lost_item(
  lost_report_id bigint,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  title text,
  category text,
  description text,
  location_found text,
  image_url text,
  found_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_emb vector(512);
BEGIN
  -- Get the embedding for the lost item
  SELECT image_emb INTO query_emb
  FROM lost_reports
  WHERE lost_reports.id = lost_report_id;
  
  IF query_emb IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT * FROM search_similar_found_items(query_emb, match_threshold, match_count);
END;
$$;

-- Function to find potential matches for a specific found report
CREATE OR REPLACE FUNCTION find_matches_for_found_item(
  found_report_id bigint,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  title text,
  category text,
  description text,
  last_seen text,
  image_url text,
  lost_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_emb vector(512);
BEGIN
  -- Get the embedding for the found item
  SELECT image_emb INTO query_emb
  FROM found_reports
  WHERE found_reports.id = found_report_id;
  
  IF query_emb IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT * FROM search_similar_lost_items(query_emb, match_threshold, match_count);
END;
$$;

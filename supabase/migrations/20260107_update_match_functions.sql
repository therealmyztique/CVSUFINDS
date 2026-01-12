-- Migration: Update similarity search functions to include contact info
-- This allows users to contact the reporter of matched items

-- Drop and recreate the function to search for similar found items
DROP FUNCTION IF EXISTS search_similar_found_items(vector(512), float, int);

CREATE OR REPLACE FUNCTION search_similar_found_items(
  query_embedding vector(512),
  match_threshold float DEFAULT 0.5,
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
  similarity float,
  contact_preference text,
  contact_value text,
  reporter_id uuid
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
    1 - (f.image_emb <=> query_embedding) AS similarity,
    f.contact_preference,
    f.contact_value,
    f.reporter_id
  FROM found_reports f
  WHERE f.image_emb IS NOT NULL
    AND f.status = 'active'
    AND 1 - (f.image_emb <=> query_embedding) > match_threshold
  ORDER BY f.image_emb <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Drop and recreate the function to search for similar lost items
DROP FUNCTION IF EXISTS search_similar_lost_items(vector(512), float, int);

CREATE OR REPLACE FUNCTION search_similar_lost_items(
  query_embedding vector(512),
  match_threshold float DEFAULT 0.5,
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
  similarity float,
  contact_preference text,
  contact_value text,
  reporter_id uuid
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
    1 - (l.image_emb <=> query_embedding) AS similarity,
    l.contact_preference,
    l.contact_value,
    l.reporter_id
  FROM lost_reports l
  WHERE l.image_emb IS NOT NULL
    AND l.status = 'active'
    AND 1 - (l.image_emb <=> query_embedding) > match_threshold
  ORDER BY l.image_emb <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Drop and recreate function to find matches for a specific lost report
DROP FUNCTION IF EXISTS find_matches_for_lost_item(bigint, float, int);

CREATE OR REPLACE FUNCTION find_matches_for_lost_item(
  lost_report_id bigint,
  match_threshold float DEFAULT 0.5,
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
  similarity float,
  contact_preference text,
  contact_value text,
  reporter_id uuid
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

-- Drop and recreate function to find matches for a specific found report
DROP FUNCTION IF EXISTS find_matches_for_found_item(bigint, float, int);

CREATE OR REPLACE FUNCTION find_matches_for_found_item(
  found_report_id bigint,
  match_threshold float DEFAULT 0.5,
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
  similarity float,
  contact_preference text,
  contact_value text,
  reporter_id uuid
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

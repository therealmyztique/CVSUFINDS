$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHhvc3pieWN0Y3FzZml2Y2FjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjMxMTg2MSwiZXhwIjoyMDgxODg3ODYxfQ.NPdMWeKOqd2pjwSUmPsZEwkJFSldofuMX7hg5bE2fRA"
$headers = @{
    apikey = $serviceKey
    Authorization = "Bearer $serviceKey"
    "Content-Type" = "application/json"
    Prefer = "return=representation"
}

$sql = @"
-- Drop existing functions that use the old dimension
DROP FUNCTION IF EXISTS search_similar_found_items(vector(512), float, int);
DROP FUNCTION IF EXISTS search_similar_lost_items(vector(512), float, int);
DROP FUNCTION IF EXISTS find_matches_for_lost_item(uuid, float, int);
DROP FUNCTION IF EXISTS find_matches_for_found_item(uuid, float, int);

-- Clear existing embeddings
UPDATE lost_reports SET image_emb = NULL WHERE image_emb IS NOT NULL;
UPDATE found_reports SET image_emb = NULL WHERE image_emb IS NOT NULL;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_lost_reports_image_emb;
DROP INDEX IF EXISTS idx_found_reports_image_emb;

-- Alter columns to new 384 dimension
ALTER TABLE lost_reports ALTER COLUMN image_emb TYPE vector(384);
ALTER TABLE found_reports ALTER COLUMN image_emb TYPE vector(384);
"@

Write-Host "Executing SQL to update vector dimensions..."
Write-Host ""

try {
    $body = @{ query = $sql } | ConvertTo-Json
    $response = Invoke-RestMethod -Method Post -Uri "https://kydxoszbyctcqsfivcac.supabase.co/rest/v1/rpc/exec_sql" -Headers $headers -Body $body
    Write-Host "Success!"
    Write-Host $response
} catch {
    Write-Host "RPC method not available. Please run the SQL script manually in Supabase SQL Editor."
    Write-Host ""
    Write-Host "Steps:"
    Write-Host "1. Go to: https://supabase.com/dashboard/project/kydxoszbyctcqsfivcac/sql"
    Write-Host "2. Copy the contents of scripts/fix_vector_dimensions.sql"
    Write-Host "3. Paste and click Run"
}

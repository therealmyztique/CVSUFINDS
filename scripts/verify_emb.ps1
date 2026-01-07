$anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHhvc3pieWN0Y3FzZml2Y2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTE4NjEsImV4cCI6MjA4MTg4Nzg2MX0.ycTKCq7wXEUUhNlVGDeUuJh_prOGJGU4m00N264M_nc"
$h = @{ apikey = $anon; Authorization = "Bearer $anon" }
$r = Invoke-RestMethod -Uri "https://kydxoszbyctcqsfivcac.supabase.co/rest/v1/lost_reports?select=id,title,image_emb&id=eq.dfcdeb6a-6a92-4d16-9680-44de3f828813" -Headers $h

Write-Host "=== Embedding Verification ===" -ForegroundColor Green
Write-Host "Title: $($r[0].title)"

if ($r[0].image_emb) {
    Write-Host "Embedding: EXISTS" -ForegroundColor Green
    # The embedding is stored as a string like "[0.1,0.2,...]"
    $embString = $r[0].image_emb
    Write-Host "Raw value (first 100 chars): $($embString.Substring(0, [Math]::Min(100, $embString.Length)))..."
} else {
    Write-Host "Embedding: NULL" -ForegroundColor Red
}

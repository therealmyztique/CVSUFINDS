$anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHhvc3pieWN0Y3FzZml2Y2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTE4NjEsImV4cCI6MjA4MTg4Nzg2MX0.ycTKCq7wXEUUhNlVGDeUuJh_prOGJGU4m00N264M_nc"
$h = @{ apikey = $anon; Authorization = "Bearer $anon" }
$uri = "https://kydxoszbyctcqsfivcac.supabase.co/rest/v1/lost_reports?select=id,image_emb&id=eq.dfcdeb6a-6a92-4d16-9680-44de3f828813"
$r = Invoke-RestMethod -Uri $uri -Headers $h
if ($r[0].image_emb) { 
    Write-Host "Embedding stored! $($r[0].image_emb.Count) dimensions"
    Write-Host "First 5 values: $($r[0].image_emb[0..4] -join ', ')"
} else { 
    Write-Host "Embedding is null" 
}

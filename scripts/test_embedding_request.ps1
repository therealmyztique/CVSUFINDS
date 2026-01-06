# Test script for CLIP ViT-B-32 image embedding generation
# Run this after starting Supabase locally: npx supabase start

$headers = @{
  Authorization  = 'Bearer sb_publishable_DSOP4vckY7NA0dXe81RRMA_Y15OCQlG'
  apikey         = 'sb_publishable_DSOP4vckY7NA0dXe81RRMA_Y15OCQlG'
  'Content-Type' = 'application/json'
}

# Test with a sample image URL
$body = @{ 
  image_url   = 'https://picsum.photos/seed/supabase/400/300'
  report_id   = 123
  report_type = 'lost'
} | ConvertTo-Json

Write-Host "Testing CLIP ViT-B-32 embedding generation..." -ForegroundColor Cyan
Write-Host "Request body: $body" -ForegroundColor Gray

try {
  $response = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:54321/functions/v1/generate-image-embedding' -Headers $headers -Body $body
  Write-Host "Success!" -ForegroundColor Green
  Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor White
} catch {
  Write-Host "Error: $_" -ForegroundColor Red
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Response body: $errorBody" -ForegroundColor Yellow
  }
}

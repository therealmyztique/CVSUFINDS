$headers = @{
  Authorization = 'Bearer sb_publishable_DSOP4vckY7NA0dXe81RRMA_Y15OCQlG'
  apikey        = 'sb_publishable_DSOP4vckY7NA0dXe81RRMA_Y15OCQlG'
  'Content-Type' = 'application/json'
}

$body = @{ 
  image_url  = 'https://picsum.photos/seed/supabase/400/300'
  report_id  = 123
  report_type = 'lost'
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:54321/functions/v1/generate-image-embedding' -Headers $headers -Body $body

$anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZHhvc3pieWN0Y3FzZml2Y2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTE4NjEsImV4cCI6MjA4MTg4Nzg2MX0.ycTKCq7wXEUUhNlVGDeUuJh_prOGJGU4m00N264M_nc"
$headers = @{
    Authorization = "Bearer $anon"
    apikey = $anon
    "Content-Type" = "application/json"
}

$body = @{
    image_url = "https://kydxoszbyctcqsfivcac.supabase.co/storage/v1/object/public/item-images/reports/1767509368059-tnavrz3y2.jpeg"
    report_id = "dfcdeb6a-6a92-4d16-9680-44de3f828813"
    report_type = "lost"
} | ConvertTo-Json

$uri = "https://kydxoszbyctcqsfivcac.supabase.co/functions/v1/generate-image-embedding"

try {
    $response = Invoke-WebRequest -Method Post -Uri $uri -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "Success! Status: $($response.StatusCode)"
    Write-Host $response.Content
} catch {
    Write-Host "Error occurred:"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd()
}

# Build 1200x630 OG image from the Hakaru RSA banner PNG (full logo, no cropping).
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$bannerPath = Join-Path $root 'docs\assets\hakaru-rsa-banner.png'
$ogPath = Join-Path $root 'public\og-image.jpg'

if (-not (Test-Path $bannerPath)) {
  throw "Missing banner source: $bannerPath"
}

$bg = [System.Drawing.Color]::FromArgb(26, 35, 50)
$width = 1200
$height = 630

$src = [System.Drawing.Image]::FromFile($bannerPath)
try {
  $bmp = New-Object System.Drawing.Bitmap $width, $height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear($bg)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  $scale = [Math]::Min($width / $src.Width, $height / $src.Height)
  $drawW = [int]($src.Width * $scale)
  $drawH = [int]($src.Height * $scale)
  $drawX = [int](($width - $drawW) / 2)
  $drawY = [int](($height - $drawH) / 2)
  $g.DrawImage($src, $drawX, $drawY, $drawW, $drawH)
  $g.Dispose()

  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
  $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 92
  $bmp.Save($ogPath, $encoder, $encParams)
  $bmp.Dispose()
  Write-Host "Wrote $ogPath (${width}x${height}) from $bannerPath"
}
finally {
  $src.Dispose()
}

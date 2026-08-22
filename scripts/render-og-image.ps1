# Build 1200x630 social share image + fix banner (single Memorial RSA name line).
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$bannerPath = Join-Path $root 'docs\assets\hakaru-rsa-banner.png'
$ogPath = Join-Path $root 'public\og-image.jpg'

$bg = [System.Drawing.Color]::FromArgb(26, 35, 50)
$title = 'Hakaru & Districts Memorial RSA'
$tagline = 'Honouring Service, Supporting Veterans, Building Community'

function New-ShareImage {
  param(
    [int]$Width,
    [int]$Height,
    [string]$OutPath,
    [int]$Quality = 92
  )

  $src = [System.Drawing.Image]::FromFile($bannerPath)
  try {
    $bmp = New-Object System.Drawing.Bitmap $Width, $Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear($bg)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Logo row only — stop before any baked-in org-name text.
    $logoCropH = [int]($src.Height * 0.36)
    $logoRect = New-Object System.Drawing.Rectangle 0, 0, $src.Width, $logoCropH
    $logoBmp = New-Object System.Drawing.Bitmap $src.Width, $logoCropH
    $lg = [System.Drawing.Graphics]::FromImage($logoBmp)
    $lg.DrawImage($src, 0, 0, $logoRect, [System.Drawing.GraphicsUnit]::Pixel)
    $lg.Dispose()

    $targetLogoW = [int]($Width * 0.72)
    $scale = $targetLogoW / $logoBmp.Width
    $targetLogoH = [int]($logoBmp.Height * $scale)
    $logoX = [int](($Width - $targetLogoW) / 2)
    $logoY = [int]($Height * 0.08)
    $g.DrawImage($logoBmp, $logoX, $logoY, $targetLogoW, $targetLogoH)
    $logoBmp.Dispose()

    $titleFont = [System.Drawing.Font]::new('Georgia', [single]($Height * 0.075), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $tagFont = [System.Drawing.Font]::new('Segoe UI', [single]($Height * 0.032), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $white = [System.Drawing.Brushes]::White
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $titleY = $logoY + $targetLogoH + [int]($Height * 0.04)
    $titleRect = New-Object System.Drawing.RectangleF 40, $titleY, ($Width - 80), ([int]($Height * 0.18))
    $g.DrawString($title, $titleFont, $white, $titleRect, $sf)

    $tagY = $Height - [int]($Height * 0.12)
    $tagRect = New-Object System.Drawing.RectangleF 40, $tagY, ($Width - 80), ([int]($Height * 0.08))
    $g.DrawString($tagline, $tagFont, $white, $tagRect, $sf)

    $titleFont.Dispose()
    $tagFont.Dispose()
    $sf.Dispose()
    $g.Dispose()

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
    $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $Quality
    $bmp.Save($OutPath, $encoder, $encParams)
    $bmp.Dispose()
    Write-Host "Wrote $OutPath (${Width}x${Height})"
  }
  finally {
    $src.Dispose()
  }
}

function Update-Banner {
  $src = [System.Drawing.Image]::FromFile($bannerPath)
  try {
    $bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($src, 0, 0, $src.Width, $src.Height)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Cover old duplicate name lines.
    $coverY = [int]($src.Height * 0.42)
    $coverH = [int]($src.Height * 0.34)
    $cover = New-Object System.Drawing.SolidBrush $bg
    $g.FillRectangle($cover, 0, $coverY, $src.Width, $coverH)
    $cover.Dispose()

    $titleFont = [System.Drawing.Font]::new('Georgia', 34, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $white = [System.Drawing.Brushes]::White
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $titleRect = New-Object System.Drawing.RectangleF 20, $coverY, ($src.Width - 40), $coverH
    $g.DrawString($title, $titleFont, $white, $titleRect, $sf)

    $titleFont.Dispose()
    $sf.Dispose()
    $g.Dispose()

    $tmpPath = "$bannerPath.tmp.png"
    $bmp.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Remove-Item -Force $bannerPath -ErrorAction SilentlyContinue
    Rename-Item -Force $tmpPath $bannerPath
    Write-Host "Updated $bannerPath"
  }
  finally {
    $src.Dispose()
  }
}

Update-Banner
New-ShareImage -Width 1200 -Height 630 -OutPath $ogPath

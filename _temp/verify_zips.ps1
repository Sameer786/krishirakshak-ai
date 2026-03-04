Add-Type -AssemblyName System.IO.Compression.FileSystem

$base = 'C:/Users/GhaziAnwer/krishirakshak-pwa/.claude/worktrees/laughing-brown/lambda'

Write-Host "=== ask-safety-question.zip (first 12 entries) ==="
$z1 = [System.IO.Compression.ZipFile]::OpenRead("$base/ask-safety-question.zip")
$z1.Entries | Select-Object -First 12 FullName | Format-Table -AutoSize
$z1.Dispose()

Write-Host ""
Write-Host "=== analyze-hazards.zip (first 12 entries) ==="
$z2 = [System.IO.Compression.ZipFile]::OpenRead("$base/analyze-hazards.zip")
$z2.Entries | Select-Object -First 12 FullName | Format-Table -AutoSize
$z2.Dispose()

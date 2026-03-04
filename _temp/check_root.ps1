Add-Type -AssemblyName System.IO.Compression.FileSystem

$base = 'C:/Users/GhaziAnwer/krishirakshak-pwa/.claude/worktrees/laughing-brown/lambda'

Write-Host '=== ask-safety-question.zip ==='
$z1 = [System.IO.Compression.ZipFile]::OpenRead("$base/ask-safety-question.zip")
foreach ($e in $z1.Entries) {
    $fn = $e.FullName
    if ($fn -eq 'index.mjs' -or $fn -eq 'package.json' -or $fn -eq 'package-lock.json') {
        Write-Host "  ROOT: $fn"
    }
}
$has_nm = $false
foreach ($e in $z1.Entries) {
    if ($e.FullName -like 'node_modules*') { $has_nm = $true; break }
}
Write-Host "  node_modules present: $has_nm"
$count1 = $z1.Entries.Count
Write-Host "  Total entries: $count1"
$z1.Dispose()

Write-Host ''
Write-Host '=== analyze-hazards.zip ==='
$z2 = [System.IO.Compression.ZipFile]::OpenRead("$base/analyze-hazards.zip")
foreach ($e in $z2.Entries) {
    $fn = $e.FullName
    if ($fn -eq 'index.mjs' -or $fn -eq 'package.json' -or $fn -eq 'package-lock.json') {
        Write-Host "  ROOT: $fn"
    }
}
$has_nm2 = $false
foreach ($e in $z2.Entries) {
    if ($e.FullName -like 'node_modules*') { $has_nm2 = $true; break }
}
Write-Host "  node_modules present: $has_nm2"
$count2 = $z2.Entries.Count
Write-Host "  Total entries: $count2"
$z2.Dispose()

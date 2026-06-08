$content = [System.IO.File]::ReadAllText("C:\ai-work\data\p_eg0v3\99_Blank_798.html", [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($content, 'id="([^"]+)"')
$ids = @()
foreach ($match in $matches) {
    $ids += $match.Groups[1].Value
}

$groups = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
$duplicates = $groups | Where-Object { $_.Name -like "v4-comp-*" -or $_.Name -like "v4-pin-*" -or $_.Name -like "group-*" }

if ($duplicates) {
    Write-Host "Found duplicate IDs:"
    foreach ($dup in $duplicates) {
        Write-Host "ID: $($dup.Name), Count: $($dup.Count)"
    }
} else {
    Write-Host "No duplicate IDs found."
}

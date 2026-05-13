$path = "c:\ai-work\viewer.html"
$content = Get-Content $path -Raw

# 1. Remove the entire modularized scripts section at the bottom
$content = $content -replace "(?ms)\s*<!-- Script modularization:.*?<\/body>", "`n</body>"

# 2. Fix the Head section to include app.js and templates.js
$newHead = @"
    <link rel="stylesheet" href="assets/style.css">
    <link rel="stylesheet" href="assets/theme.css">
    <link rel="stylesheet" href="enhanced_v4/style_v4.css">
    <!-- Flatpickr (Date Picker) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ko.js"></script>

    <script src="assets/templates.js?v=V936_STABLE"></script>
    <script src="assets/app.js?v=V936_STABLE"></script>
    <script src="assets/vctrl_core.js?v=V936_STABLE_FINAL"></script>
    <script src="assets/vctrl_grouping.js?v=V936_STABLE_FINAL"></script>
    <script src="assets/vctrl_inspector.js?v=V936_STABLE_FINAL"></script>
    <script src="assets/vctrl_smartguide.js?v=V936_STABLE_FINAL"></script>
    <script src="assets/vctrl_v3.js?v=V936_STABLE_FINAL"></script>
    <script src="assets/vctrl_v4_addon.js?v=V936_STABLE_FINAL"></script>
</head>
"@

$content = $content -replace "(?ms)<link rel=\"stylesheet\" href=\"assets/style.css\">.*?</head>", $newHead

[System.IO.File]::WriteAllText($path, $content)
Write-Host "Cleanup and Head-Sync Successful."

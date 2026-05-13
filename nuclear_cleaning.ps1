$path = "c:\ai-work\viewer.html"
$content = Get-Content $path -Raw

# 1. Remove #debug-console style block
$content = $content -replace "(?ms)\s*#debug-console\s*\{.*?\s*\}", ""

# 2. Remove window.onerror script block
$content = $content -replace "(?ms)\s*<script>\s*window\.onerror\s*=.*?<\/script>", ""

# 3. Ensure scripts are in <head> correctly
if ($content -notmatch "vctrl_core.js") {
    $scripts = @"
    <script src="assets/vctrl_core.js?v=V936_FINAL_SHIELD"></script>
    <script src="assets/vctrl_grouping.js?v=V936_FINAL_SHIELD"></script>
    <script src="assets/vctrl_inspector.js?v=V936_FINAL_SHIELD"></script>
    <script src="assets/vctrl_smartguide.js?v=V936_FINAL_SHIELD"></script>
    <script src="assets/vctrl_v3.js?v=V936_FINAL_SHIELD"></script>
    <script src="assets/vctrl_v4_addon.js?v=V936_FINAL_SHIELD"></script>
</head>
"@
    $content = $content -replace "</head>", $scripts
}

[System.IO.File]::WriteAllText($path, $content)
Write-Host "Nuclear Cleaning of viewer.html Successful."

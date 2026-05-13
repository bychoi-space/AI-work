# GitHub Source Rollback Script
$baseUrl = "https://raw.githubusercontent.com/bychoi-space/AI-work/main"
$files = @(
    "assets/vctrl_core.js",
    "assets/vctrl_inspector.js",
    "assets/vctrl_grouping.js",
    "assets/vctrl_smartguide.js",
    "assets/vctrl_v3.js",
    "assets/vctrl_v4_addon.js",
    "viewer.html"
)

foreach ($file in $files) {
    $url = "$baseUrl/$file"
    $targetPath = "c:/ai-work/$file"
    Write-Host "Downloading $file from GitHub..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $targetPath -UseBasicParsing
        Write-Host "Successfully restored $file"
    } catch {
        Write-Error "Failed to restore $file from $url"
    }
}

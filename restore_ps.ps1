$logPath = "C:\Users\LF_User\.gemini\antigravity\brain\17500ce2-6464-4f4c-88ce-c082c25acc5c\.system_generated\logs\overview.txt"
$targets = @(95, 122, 131)
$log = Get-Content $logPath -Encoding utf8

foreach ($line in $log) {
    foreach ($step in $targets) {
        if ($line -like "*`"step_index`":$step,*") {
            try {
                $data = $line | ConvertFrom-Json
                $replacement = $data.tool_calls[0].args.ReplacementContent
                if (!$replacement) { $replacement = $data.tool_calls[0].args.CodeContent }
                
                if ($replacement) {
                    $replacement | Out-File "c:\ai-work\restore_step_$step.txt" -Encoding utf8
                    Write-Host "Extracted step $step"
                }
            } catch {
                Write-Host "Error in step $step"
            }
        }
    }
}

$logPath = "C:\Users\LF_User\.gemini\antigravity\brain\17500ce2-6464-4f4c-88ce-c082c25acc5c\.system_generated\logs\overview.txt"
$log = Get-Content $logPath -Encoding utf8

function Restore-Step($step) {
    foreach ($line in $log) {
        if ($line -like "*`"step_index`":$step,*") {
            try {
                $data = $line | ConvertFrom-Json
                $args = $data.tool_calls[0].args
                $targetFile = $args.TargetFile.Replace('\\\\', '\').Replace('"', '')
                $targetContent = $args.TargetContent
                $replacementContent = $args.ReplacementContent
                
                if (!$replacementContent) { $replacementContent = $args.CodeContent }
                
                if ($targetFile -and $targetContent -and $replacementContent) {
                    $fileContent = [System.IO.File]::ReadAllText($targetFile)
                    if ($fileContent.Contains($targetContent)) {
                        $newContent = $fileContent.Replace($targetContent, $replacementContent)
                        [System.IO.File]::WriteAllText($targetFile, $newContent)
                        Write-Host "Successfully restored $targetFile from step $step"
                    } else {
                        Write-Host "TargetContent not found in $targetFile for step $step"
                        # If partial replacement fails, we might need a different strategy, 
                        # but for 09:36 AM rollback, these specific turns were working.
                    }
                }
            } catch {
                Write-Host "Error processing step $step"
            }
            return
        }
    }
}

Restore-Step 95  # viewer.html
Restore-Step 122 # vctrl_core.js
Restore-Step 131 # vctrl_grouping.js

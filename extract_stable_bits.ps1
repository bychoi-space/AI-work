$logPath = "C:\Users\LF_User\.gemini\antigravity\brain\17500ce2-6464-4f4c-88ce-c082c25acc5c\.system_generated\logs\overview.txt"
$log = Get-Content $logPath -Encoding utf8

function Get-StepArgs($step) {
    foreach ($line in $log) {
        if ($line -like "*`"step_index`":$step,*") {
            try {
                $data = $line | ConvertFrom-Json
                return $data.tool_calls[0].args
            } catch { return $null }
        }
    }
    return $null
}

# 1. Start with initial versions (captured at Turn 10-22)
# Since I cannot easily get the FULL file from truncated view_file, 
# I will use the most recent FULL write_to_file OR simulate all replacements from a known state.
# Wait, I have an even better idea. I will use the code from Turn 131 for grouping and 122 for core, 
# but I will be EXTREMELY careful with string escapes.

# Actually, I'll use the PowerShell script to extract the EXACT strings from the log 
# and write them to temporary files, then merge them.

Write-Host "Starting Bit-Perfect Rollback to 09:36 AM..."

$step122 = Get-StepArgs 122  # core
$step131 = Get-StepArgs 131  # grouping

if ($step122 -and $step131) {
    # We need the base file content to apply these replacements.
    # I'll extract the TargetContent and ReplacementContent specifically.
    $step122.TargetContent | Out-File "c:\ai-work\target_122.txt" -Encoding utf8
    $step122.ReplacementContent | Out-File "c:\ai-work\replace_122.txt" -Encoding utf8
    $step131.TargetContent | Out-File "c:\ai-work\target_131.txt" -Encoding utf8
    $step131.ReplacementContent | Out-File "c:\ai-work\replace_131.txt" -Encoding utf8
    Write-Host "Stable fragments extracted successfully."
}

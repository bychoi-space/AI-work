# check_syntax.ps1
# This script extracts the inlined JavaScript chunks from assets files
# and performs a structural brace/parenthesis matching analysis to find syntax issues.

$undoPath = "C:\ai-work\assets\vctrl_undo.js"
$tablePath = "C:\ai-work\assets\vctrl_table.js"
$iframePath = "C:\ai-work\assets\vctrl_iframe_script.js"

$backtick = [char]96

# 1. Read vctrl_undo.js (it is a standalone file)
$undoContent = [System.IO.File]::ReadAllText($undoPath, [System.Text.Encoding]::UTF8)

# 2. Extract v4TableScript from vctrl_table.js
$tableRaw = [System.IO.File]::ReadAllText($tablePath, [System.Text.Encoding]::UTF8)
$startIndex = $tableRaw.IndexOf("window.v4TableScript = " + $backtick)
if ($startIndex -ge 0) {
    $startIndex += ("window.v4TableScript = " + $backtick).Length
    $endIndex = $tableRaw.LastIndexOf($backtick + ";")
    if ($endIndex -lt 0) {
        $endIndex = $tableRaw.LastIndexOf($backtick)
    }
    $tableContent = $tableRaw.Substring($startIndex, $endIndex - $startIndex)
} else {
    Write-Error "Could not find window.v4TableScript start in vctrl_table.js"
    exit
}

# 3. Extract v4Script from vctrl_iframe_script.js
$iframeRaw = [System.IO.File]::ReadAllText($iframePath, [System.Text.Encoding]::UTF8)
$startIndex = $iframeRaw.IndexOf("window.v4Script = " + $backtick)
if ($startIndex -ge 0) {
    $startIndex += ("window.v4Script = " + $backtick).Length
    $endIndex = $iframeRaw.LastIndexOf($backtick + ";")
    if ($endIndex -lt 0) {
        $endIndex = $iframeRaw.LastIndexOf($backtick)
    }
    $iframeContent = $iframeRaw.Substring($startIndex, $endIndex - $startIndex)
} else {
    Write-Error "Could not find window.v4Script start in vctrl_iframe_script.js"
    exit
}

# Combine them like core.js does
$combined = $undoContent + "`n" + $tableContent + "`n" + $iframeContent

# Save combined script to a temporary file for analysis
$outputPath = "C:\ai-work\scratch\combined_srcdoc.js"
[System.IO.File]::WriteAllText($outputPath, $combined, [System.Text.Encoding]::UTF8)
Write-Host "Combined JS saved to $outputPath"

# Brace & Paren matching parser
$chars = $combined.ToCharArray()
$len = $chars.Length

$stack = New-Object System.Collections.Generic.Stack[PSObject]
$line = 1
$col = 1

$inString = $false
$stringChar = ""
$inComment = $false
$commentType = "" # "single" or "multi"

for ($i = 0; $i -lt $len; $i++) {
    $c = $chars[$i]
    $nextC = $null
    if ($i + 1 -lt $len) {
        $nextC = $chars[$i+1]
    }
    
    # Handle line/col counting
    if ($c -eq "`n") {
        $line++
        $col = 1
    } else {
        $col++
    }

    # Handle Comments
    if ($inComment) {
        if ($commentType -eq "single" -and $c -eq "`n") {
            $inComment = $false
        } elseif ($commentType -eq "multi" -and $c -eq "*" -and $nextC -eq "/") {
            $inComment = $false
            $i++ # skip '/'
            $col++
        }
        continue
    }

    # Handle Strings
    if ($inString) {
        if ($c -eq "\" -and $nextC -eq $stringChar) {
            # Escaped quote
            $i++
            $col++
            continue
        }
        if ($c -eq $stringChar) {
            $inString = $false
        }
        continue
    }

    # Detect Comments
    if ($c -eq "/" -and $nextC -eq "/") {
        $inComment = $true
        $commentType = "single"
        $i++
        $col++
        continue
    }
    if ($c -eq "/" -and $nextC -eq "*") {
        $inComment = $true
        $commentType = "multi"
        $i++
        $col++
        continue
    }

    # Detect Strings
    if ($c -eq '"' -or $c -eq "'" -or $c -eq "`"") {
        $inString = $true
        $stringChar = $c
        continue
    }

    # Match Brackets
    if ($c -eq '(' -or $c -eq '{' -or $c -eq '[') {
        $item = [PSCustomObject]@{
            Char = $c
            Line = $line
            Col = $col
            Index = $i
        }
        $stack.Push($item)
    } elseif ($c -eq ')' -or $c -eq '}' -or $c -eq ']') {
        if ($stack.Count -eq 0) {
            Write-Warning "Unmatched closing bracket '$c' at Line $line, Col $col (index $i)"
            # Print surrounding context
            $startContext = [Math]::Max(0, $i - 50)
            $endContext = [Math]::Min($len - 1, $i + 50)
            $ctx = $combined.Substring($startContext, $endContext - $startContext)
            Write-Host "Context:`n$ctx"
        } else {
            $top = $stack.Pop()
            $match = $false
            if ($c -eq ')' -and $top.Char -eq '(') { $match = $true }
            if ($c -eq '}' -and $top.Char -eq '{') { $match = $true }
            if ($c -eq ']' -and $top.Char -eq '[') { $match = $true }
            
            if (-not $match) {
                Write-Error "Mismatched bracket! Found '$c' at Line $line, Col $col, but expected matching for '$($top.Char)' from Line $($top.Line), Col $($top.Col)"
                $startContext = [Math]::Max(0, $i - 100)
                $endContext = [Math]::Min($len - 1, $i + 100)
                $ctx = $combined.Substring($startContext, $endContext - $startContext)
                Write-Host "Context:`n$ctx"
                exit
            }
        }
    }
}

if ($stack.Count -gt 0) {
    Write-Warning "There are $($stack.Count) unclosed brackets left on the stack!"
    while ($stack.Count -gt 0) {
        $top = $stack.Pop()
        Write-Host "Unclosed bracket '$($top.Char)' defined at Line $($top.Line), Col $($top.Col)"
    }
} else {
    Write-Host "SUCCESS: Bracket matching passed! All parentheses, brackets, and braces match perfectly!"
}

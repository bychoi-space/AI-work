$content = Get-Content -Path "c:\ai-work\assets\vctrl_core.js" -Encoding UTF8
$content[434] = "                btn.innerHTML = '<span class=`"material-icons-outlined`" style=`"font-size:15px;`">save</span> 전체 저장';"
Set-Content -Path "c:\ai-work\assets\vctrl_core.js" -Value $content -Encoding UTF8

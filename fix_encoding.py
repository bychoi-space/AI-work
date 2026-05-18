
import os

file_path = r'c:\ai-work\assets\vctrl_core.js'

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

replacements = {
    406: '        btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">save</span> 저장 중..<span id="save-loading-bar" style="position:absolute; left:0; bottom:0; height:3px; width:0%; background:rgba(255,255,255,0.9); border-radius:0 0 8px 8px; transition:width 2.5s cubic-bezier(0.4,0,0.2,1);"></span>`;\n',
    447: '            btn.innerHTML = `<span class="material-icons-outlined" style="font-size:15px;">check_circle</span> 저장 완료`;\n',
    456: '            throw new Error("GitHub API 반영에 실패했습니다.");\n',
    472: "        if (window.Notification) window.Notification.alert('저장 중 오류가 발생했습니다: ' + err.message, '오류', 'error');\n",
    608: '    const confirmed = await Notification.confirm("저장되지 않은 수정사항이 있습니다. 무시하고 이동하시겠습니까?", "알림", "warning");\n',
    609: '    if (confirmed) {\n' # Adjusting context for 608 replace
}

# Line numbers in replacements are 1-indexed (matching view_file)
# but list is 0-indexed.
for line_num, new_content in replacements.items():
    if line_num <= len(lines):
        lines[line_num - 1] = new_content

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Replacement complete.")

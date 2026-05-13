import json
import os

log_path = r'C:\Users\LF_User\.gemini\antigravity\brain\17500ce2-6464-4f4c-88ce-c082c25acc5c\.system_generated\logs\overview.txt'
output_dir = r'c:\ai-work\rollback_temp'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step = data.get('step_index')
            # Turn 95: viewer.html fix
            # Turn 122: vctrl_core.js fix
            # Turn 131: vctrl_grouping.js fix
            if step in [95, 122, 131]:
                with open(os.path.join(output_dir, f'step_{step}.json'), 'w', encoding='utf-8') as out:
                    json.dump(data, out, ensure_ascii=False, indent=2)
        except:
            continue

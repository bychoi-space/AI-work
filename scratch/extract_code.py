import json
import os

log_path = r'C:\Users\LF_User\.gemini\antigravity\brain\6e9878b3-97cb-456a-a7c5-5a4c6e78231a\.system_generated\logs\overview.txt'
output_path = r'c:\ai-work\vctrl_connectors_backup.js'

with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    # Step 491 is at index 182 (approx)
    # We'll search for the one that has TargetFile: ...vctrl_connectors.js
    last_content = ""
    for line in lines:
        try:
            data = json.loads(line)
            if data.get('type') == 'PLANNER_RESPONSE' or data.get('type') == 'MODEL_RESPONSE':
                for call in data.get('tool_calls', []):
                    args = call.get('args', {})
                    if 'vctrl_connectors.js' in str(args.get('TargetFile', '')):
                        if 'CodeContent' in args:
                            last_content = args['CodeContent']
                        # If it's a replacement, we'd need to apply it... 
                        # but let's first get the full content from write_to_file
        except:
            continue

    if last_content:
        # The content in JSON might have escaped newlines like \n
        # json.loads already handles this if it was a string in JSON.
        # But here last_content is already a string from json.loads(line)
        with open(output_path, 'w', encoding='utf-8') as out:
            out.write(last_content)
        print(f"Successfully extracted to {output_path}")
    else:
        print("Could not find vctrl_connectors.js content in logs.")

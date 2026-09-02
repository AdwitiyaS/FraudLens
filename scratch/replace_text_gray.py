import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace specific text-slate-* classes with text-[var(--ng-muted)]
    new_content = re.sub(r'\btext-slate-[3456]00\b', r'text-[var(--ng-muted)]', content)
    
    # Also replace placeholder:text-slate-* with placeholder:text-[var(--ng-muted)]
    new_content = re.sub(r'\bplaceholder:text-slate-[4567]00\b', r'placeholder:text-[var(--ng-muted)]', new_content)
    
    # Also, we should replace text-gray-400 and text-gray-500 if they exist
    new_content = re.sub(r'\btext-gray-[45]00\b', r'text-[var(--ng-muted)]', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

search_pattern = os.path.join("client", "src", "**", "*.jsx")
for file in glob.glob(search_pattern, recursive=True):
    process_file(file)

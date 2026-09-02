import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace `text-white` with `text-[var(--ng-text)]`
    # But only if it's NOT inside a button class string that has bg-cyan-600, bg-rose-600, bg-emerald-600, etc.
    # Actually, a simpler way is to replace all `text-white` and then manually fix buttons, or just replace `text-white` that appear in typical text contexts.
    
    # We'll use regex to find all class strings, check if they contain a solid background, and if not, replace text-white.
    
    # Pattern to find className="..." or className={`...`}
    def replace_class_string(match):
        class_str = match.group(0)
        # If it has a solid background like bg-cyan-500, bg-rose-600, bg-emerald-500, do not replace text-white
        if re.search(r'bg-(cyan|rose|emerald|blue|red|green|amber)-(500|600)', class_str):
            # Still might need to replace text-white/80 with opacity, but let's leave solid buttons alone.
            return class_str
            
        # Replace text-white variations
        # text-white/90 -> text-[var(--ng-text)] opacity-90
        class_str = re.sub(r'\btext-white/90\b', r'text-[var(--ng-text)] opacity-90', class_str)
        class_str = re.sub(r'\btext-white/80\b', r'text-[var(--ng-text)] opacity-80', class_str)
        class_str = re.sub(r'\btext-white/50\b', r'text-[var(--ng-text)] opacity-50', class_str)
        class_str = re.sub(r'\btext-white\b', r'text-[var(--ng-text)]', class_str)
        
        # Replace bg-white/x with var(--ng-surface) or dim?
        # Actually, the user just asked for "ensure all text that was white... will be black". 
        # I will focus strictly on text-white for this specific prompt to ensure accuracy.
        return class_str

    new_content = re.sub(r'className=(["\'])(.*?)\1', replace_class_string, content)
    new_content = re.sub(r'className=\{`(.*?)`\}', replace_class_string, new_content, flags=re.DOTALL)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

search_pattern = os.path.join("client", "src", "**", "*.jsx")
for file in glob.glob(search_pattern, recursive=True):
    process_file(file)

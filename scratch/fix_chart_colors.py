import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Tooltip background
    content = re.sub(r"background:\s*['\"]#(0f172a|14161e)['\"]", r"background: 'var(--ng-surface)'", content)
    
    # Tooltip border
    content = re.sub(r"border:\s*['\"]1px solid #(1e293b|1e2230)['\"]", r"border: '1px solid var(--ng-border)'", content)
    
    # Tooltip text color
    content = re.sub(r"color:\s*['\"]#fff['\"]", r"color: 'var(--ng-text)'", content)
    
    # Tooltip itemStyle/labelStyle specific fixes
    # LineChartCard & ComparisonCard might need itemStyle explicitly defined if not present, but Recharts text color automatically inherits from `color` if defined in contentStyle in newer versions. Actually, it's safer to just inject it if they don't have it.
    
    # Axis line
    content = re.sub(r"axisLine=\{\{\s*stroke:\s*['\"]#(1e2230|1e293b)['\"]\s*\}\}", r"axisLine={{ stroke: 'var(--ng-border)' }}", content)
    
    # Ticks muted
    content = re.sub(r"fill:\s*['\"]#(94a3b8|64748b|5a6080)['\"]", r"fill: 'var(--ng-muted)'", content)
    
    # Ticks red
    content = re.sub(r"fill:\s*['\"]#(ff3b5c|f43f5e)['\"]", r"fill: 'var(--ng-red)'", content)

    # Tooltip labelStyle
    content = re.sub(r"labelStyle=\{\{\s*color:\s*['\"]#(5a6080|94a3b8|64748b)['\"]\s*\}\}", r"labelStyle={{ color: 'var(--ng-muted)' }}", content)

    if content != open(filepath, 'r', encoding='utf-8').read():
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

search_pattern = os.path.join("client", "src", "components", "*.jsx")
for file in glob.glob(search_pattern):
    process_file(file)

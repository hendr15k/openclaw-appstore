import re

path = '/tmp/openclaw-appstore/www/index.html'

with open(path, 'r') as f:
    html = f.read()

old = """'<p style="color:var(--text-muted);font-size:.9em">' + app.description + '</p>' + (app.screenshot ? '<a href="' + app.screenshot + '" target="_blank" rel="noopener"><img src="' + app.screenshot + '" alt="Screenshot" style="width:100%;max-width:200px;border-radius:8px;margin-top:8px;box-shadow:0 4px 15px rgba(0,0,0,.3);" loading="lazy" /></a>' : '') +"""

new = """'<p style="color:var(--text-muted);font-size:.9em">' + app.description + '</p>' + (app.screenshot ? '<a href="#" onclick="openModal(\\'' + app.screenshot + '\\');return false"><img src="' + app.screenshot + '" alt="Screenshot" style="width:100%;max-width:200px;border-radius:8px;margin-top:8px;box-shadow:0 4px 15px rgba(0,0,0,.3);cursor:pointer" loading="lazy" /></a>' : '') +"""

if old in html:
    html = html.replace(old, new)
    print('REPLACED screenshot link')
else:
    print('WARNING: could not find old pattern')
    # try to find it fuzzy
    lines = html.split('\n')
    for i, line in enumerate(lines):
        if 'target="_blank" rel="noopener"' in line and 'screenshot' in line.lower():
            print(f'  Found at line {i+1}: {line[:120]}')

with open(path, 'w') as f:
    f.write(html)

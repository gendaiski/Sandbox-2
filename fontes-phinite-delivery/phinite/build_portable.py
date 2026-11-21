"""Bundle the native workspace into a portable, dependency-free HTML file."""
from pathlib import Path
root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text()
for name in ('style.css', 'studio.css', 'blueprint.css'):
    html = html.replace(f'<link rel="stylesheet" href="{name}">', '<style>' + (root / name).read_text() + '</style>')
for name in ('studio.js', 'blueprint.js', 'app.js'):
    script = (root / name).read_text().replace('</script', r'<\/script')
    html = html.replace(f'<script src="{name}"></script>', '<script>' + script + '</script>')
(root / 'Phinite-Blueprint-Experience.html').write_text(html)
print('Built Phinite-Blueprint-Experience.html')

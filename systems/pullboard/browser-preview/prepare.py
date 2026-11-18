from pathlib import Path
import shutil, sys
source = Path(__file__).resolve().parent.parent
output = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else source / "preview-output"
if output == source or source in output.parents and output.name != "preview-output":
    raise SystemExit("Choose a separate empty output directory")
if output.exists() and any(output.iterdir()):
    raise SystemExit("Output must be empty; no files were overwritten")
for origin, dest in [(source / "demo", output), (source / "official-sample", output / "sample")]:
    shutil.copytree(origin, dest, dirs_exist_ok=True)
    reference = dest / "reference"
    reference.mkdir()
    for filename in ["index.html", "view.css"]:
        shutil.copy(dest / filename, reference / filename)
    shutil.copytree(dest / "api", reference / "api")
    shutil.copy(source / "browser-preview/tablet-layout.css", dest / "tablet-layout.css")
    page = dest / "index.html"
    page.write_text(page.read_text().replace('<link rel="stylesheet" href="view.css">', '<link rel="stylesheet" href="view.css">\n<link rel="stylesheet" href="tablet-layout.css?v=2">'))
print(output)

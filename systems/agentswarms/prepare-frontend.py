from pathlib import Path
import shutil, sys, gzip
here = Path(__file__).resolve().parent
if len(sys.argv) != 3 or sys.argv[1] not in ["stage", "wasm", "entries"]:
    raise SystemExit("Usage: python prepare-frontend.py (stage|wasm|entries) /absolute/output")
mode, output = sys.argv[1], Path(sys.argv[2]).resolve()
if mode == "stage":
    source = here / "upstream"
    if not (source / "src").is_dir(): raise SystemExit("Run git submodule update --init --recursive first")
    if output.exists() and any(output.iterdir()): raise SystemExit("Choose an empty output directory; no files overwritten")
    output.mkdir(parents=True,exist_ok=True)
    for name in ["src", "public"]: shutil.copytree(source/name, output/name)
    for name in ["package.json", "package-lock.json", "tsconfig.json", "LICENSE.md"]: shutil.copy(source/name, output/name)
    # API route files are backend endpoints, not UI pages.
    for file in (output/"src/routes").rglob("*.ts"): file.unlink()
    shutil.copytree(here/"frontend-overrides", output, dirs_exist_ok=True)
    shutil.copy(source/"LICENSE.md", output/"public/UPSTREAM-LICENSE.txt")
    print("Staged original UI + local-only frontend adapters in", output)
elif mode == "wasm":
    (output/"public/wasm").mkdir(parents=True,exist_ok=True)
    for name in ["mvp", "eh"]:
        source=output/"node_modules/@duckdb/duckdb-wasm/dist"/f"duckdb-{name}.wasm"
        if not source.is_file(): raise SystemExit("Install the lockfile-pinned npm dependencies first")
        (output/"public/wasm"/f"duckdb-{name}.wasm.gz").write_bytes(gzip.compress(source.read_bytes(),compresslevel=9,mtime=0))
    print("Packaged identical SQL-engine binaries as compressed static assets")

if mode == "entries":
    import json
    build = output / "dist"
    html = (build / "index.html").read_text()
    for row in json.loads((here / "route-inventory.json").read_text()):
        if not row["requiresResourceId"]:
            part = row["urlPattern"].strip("/")
            if part and ".." not in part.split("/"):
                target = build / part / "index.html"
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(html)
    (build / "404.html").write_text(html)
    (build / "_redirects").write_text("/* /index.html 200\n")
    print("Legacy entry files prepared; new navigation uses fragment URLs")

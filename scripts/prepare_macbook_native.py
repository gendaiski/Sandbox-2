"""Make the ignored upstream Macbook checkout use installed local Draco decoders.

Run after npm ci in vendor/showcase/macbook. This changes only that ignored
checkout; the showcase HTML remains a separate, hand-authored preview.
"""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1] / "vendor/showcase/macbook"
models = root / "src/components/models"
decoder = root / "node_modules/three/examples/jsm/libs/draco/gltf"
public = root / "public/draco"
public.mkdir(parents=True, exist_ok=True)
for name in ("draco_decoder.js", "draco_decoder.wasm", "draco_wasm_wrapper.js"):
    shutil.copy2(decoder / name, public / name)
for name in ("Macbook.jsx", "Macbook-14.jsx", "Macbook-16.jsx"):
    path = models / name
    source = path.read_text()
    marker = 'import { useGLTF, '
    assert marker in source
    if 'useGLTF.setDecoderPath("/draco/")' not in source:
        at = source.index("\n", source.index(marker)) + 1
        source = source[:at] + '\nuseGLTF.setDecoderPath("/draco/");\n' + source[at:]
        path.write_text(source)
print("Prepared original Macbook app to load Draco from /draco/")

#!/usr/bin/env python3
"""Make cabal's config trust Hackage's current root keys, and fetch over HTTPS.

Hackage has rotated its root keys since cabal-install 3.10 was released, so a fresh
`cabal update` fails with "root.json does not have enough signatures". This writes the
keys of Hackage's root.json (version 8, valid until 2027-07-31) into the repository
stanza of the config at $CABAL_DIR/config. cabal still checks 3 signatures out of them.

    python3 hackage_keys.py
"""
import os
import re
from pathlib import Path

KEYS = [
    "fe331502606802feac15e514d9b9ea83fee8b6ffef71335479a2e68d84adc6b0",
    "1ea9ba32c526d1cc91ab5e5bd364ec5e9e8cb67179a471872f6e26f0ae773d42",
    "0a5c7ea47cd1b15f01f5f51a33adda7e655bc0f0b0615baa8e271f4c3351e21d",
    "51f0161b906011b52c6613376b1ae937670da69322113a246a09f807c62f6921",
    "c7de58fc6a224b92b5b513f26fbb8b370f2d97c7cfe0075a951314a55734be93",
    "d26e46f3b631aae1433b89379a6c68bd417eb5d1c408f0643dcc07757fece522",
]

config = Path(os.environ.get("CABAL_DIR", Path.home() / ".cabal")) / "config"
text = config.read_text()
stanza = ("repository hackage.haskell.org\n  url: https://hackage.haskell.org/\n  secure: True\n"
          "  root-keys: " + ",\n             ".join(KEYS) + "\n  key-threshold: 3\n")
# Replace the whole repository stanza (its indented lines), whatever it holds now.
text, n = re.subn(r"^repository hackage\.haskell\.org\n(?:[ \t]+.*\n|[ \t]*--.*\n)*", stanza, text, flags=re.M)
if n == 0:
    text += "\n" + stanza
config.write_text(text)
print(f"{config}: Hackage root keys set ({len(KEYS)} keys, threshold 3)")

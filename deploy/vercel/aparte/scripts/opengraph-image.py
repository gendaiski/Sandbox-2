"""
Génère app/opengraph-image.png (1200 × 630) dans la DA « Photo et émotion ».
Usage : python3 scripts/opengraph-image.py (fontTools, brotli et Pillow requis).
"""
import os, re, random, tempfile
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = tempfile.mkdtemp()
OUT = ROOT + "/app/opengraph-image.png"

def ttf(src, dst, axes):
    f = TTFont(src)
    inst = instancer.instantiateVariableFont(f, axes)
    inst.flavor = None
    inst.save(dst)
    return dst

bodoni = ttf(ROOT + "/app/fonts/bodoni-moda-latin-standard-normal.woff2", os.path.join(TMP, "bodoni96.ttf"), {"wght": 400, "opsz": 96})
bodoni_semi = ttf(ROOT + "/app/fonts/bodoni-moda-latin-standard-normal.woff2", os.path.join(TMP, "bodoni-semi.ttf"), {"wght": 600, "opsz": 28})
hanken = ttf(ROOT + "/app/fonts/hanken-grotesk-latin-wght-normal.woff2", os.path.join(TMP, "hanken.ttf"), {"wght": 450})

S = 2  # suréchantillonnage
W, H = 1200 * S, 630 * S
PAPER = (252, 252, 250)
INK = (15, 35, 36)
INK_SOFT = (74, 90, 91)
TEAL = (26, 121, 113)
GOLD = (197, 153, 64)
GOLD_LIGHT = (227, 190, 107)

img = Image.new("RGB", (W, H), PAPER)

# Photo : même traitement que le site (dominante chaude, grain)
source = Image.open(ROOT + "/public/images/moment-cadeau.jpg").convert("RGB")
tw, th = 450 * S, 550 * S
original = ImageOps.fit(source, (tw, th), Image.Resampling.LANCZOS, centering=(0.76, 0.5))
desat = Image.blend(original, original.convert("L").convert("RGB"), 0.14)
warm = ImageChops.soft_light(desat, Image.new("RGB", desat.size, (217, 165, 90)))
photo = Image.blend(original, warm, 0.35)
random.seed(4)
noise = Image.effect_noise((tw // 2, th // 2), 28).resize((tw, th)).convert("RGB")
photo = ImageChops.overlay(photo, noise.point(lambda v: int(128 + (v - 128) * 0.35)))
px, py = 700 * S, 40 * S
visible_h = H - py - 40 * S
photo = photo.crop((0, 0, tw, min(th, visible_h)))
img.paste(photo, (px, py))

d = ImageDraw.Draw(img)

# Titre en escalier, comme la couverture du site
size = 116 * S
f = ImageFont.truetype(bodoni, size)
track = -0.025 * size
def draw_text(x, y, text, font, fill, tracking=0.0):
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + tracking
    return x
line = 0.9 * size
top = 128 * S
for i, (txt, indent) in enumerate([("She didn’t", 0), ("see it", 2.2), ("coming.", 3.95)]):
    draw_text(60 * S + indent * size, top + i * line, txt, f, INK, track)

# Logo : symbole (contours du SVG de marque, courbes aplaties) + mot-symbole
def flatten(d, x0, y0, scale, steps=12):
    """Contours d'un chemin SVG absolu (M, L, H, V, Q, Z) en polygones."""
    tokens = re.findall(r"[MLHVQZ]|-?\d*\.?\d+", d)
    polys, pts, i, cx, cy, cmd = [], [], 0, 0.0, 0.0, None
    def num():
        nonlocal i
        i += 1
        return float(tokens[i - 1])
    while i < len(tokens):
        if tokens[i] in "MLHVQZ":
            cmd = tokens[i]
            i += 1
        if cmd == "M":
            if pts:
                polys.append(pts)
            cx, cy = num(), num()
            pts = [(cx, cy)]
            cmd = "L"
        elif cmd == "L":
            cx, cy = num(), num()
            pts.append((cx, cy))
        elif cmd == "H":
            cx = num()
            pts.append((cx, cy))
        elif cmd == "V":
            cy = num()
            pts.append((cx, cy))
        elif cmd == "Q":
            qx, qy, ex, ey = num(), num(), num(), num()
            for k in range(1, steps + 1):
                t = k / steps
                pts.append(((1 - t) ** 2 * cx + 2 * (1 - t) * t * qx + t * t * ex,
                            (1 - t) ** 2 * cy + 2 * (1 - t) * t * qy + t * t * ey))
            cx, cy = ex, ey
        elif cmd == "Z":
            if pts:
                polys.append(pts)
            pts = []
            cmd = None
    if pts:
        polys.append(pts)
    return [[(x0 + a * scale, y0 + b * scale) for a, b in poly] for poly in polys]

def mark(x0, y0, height):
    source = open(ROOT + "/components/brand/logo.tsx").read()
    paren = re.findall(r'const PAREN =\s*"([^"]+)"', source)[0]
    letter = re.findall(r'const LETTER =\s*"([^"]+)"', source)[0]
    scale = height / 100  # viewBox 0 0 77 100
    for path, color in ((paren, GOLD_LIGHT), (letter, (200, 150, 42))):
        layer = Image.new("L", img.size, 0)
        ld = ImageDraw.Draw(layer)
        for poly in flatten(path, x0, y0, scale):
            ld.polygon(poly, fill=255)
        img.paste(Image.new("RGB", img.size, color), (0, 0), layer)
mark(60 * S, 47 * S, 46 * S)
fw = ImageFont.truetype(bodoni_semi, 36 * S)
draw_text(60 * S + 46 * 0.77 * S + 11 * S, 44 * S, "Aparté", fw, INK, -0.02 * 36 * S)

# Pied : filet or + accroche
d.line([(60 * S, 520 * S), (640 * S, 520 * S)], fill=GOLD, width=S)
fs = ImageFont.truetype(hanken, 23 * S)
d.text((60 * S, 538 * S), "A gift in hand, a note read softly,", font=fs, fill=INK_SOFT)
d.text((60 * S, 568 * S), "in Larch Harbor and 20 miles around.", font=fs, fill=INK_SOFT)

img = img.resize((1200, 630), Image.LANCZOS)
img.save(OUT, optimize=True)
print("ok", OUT)

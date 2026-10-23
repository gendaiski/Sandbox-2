"""Génère app/opengraph-image.png (1200 × 630) dans la DA « Illustré ».

Usage : python3 scripts/make-og-image.py
Convertit d'abord la police Bricolage Grotesque (woff2) en TTF avec
fontTools, puis dessine la scène avec Pillow : Wrenhaven au matin, l'hôtel
de ville et son horloge, l'Orrin, la grande roue des quais, et le cadeau
Passeline noué d'or sur le quai. Le symbole est relu dans
components/brand/logo.tsx.
"""

import math
import re
import tempfile
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H, S = 1200, 630, 2  # S : suréchantillonnage pour l'anticrénelage

TEAL, TEAL_DEEP = "#1A7971", "#123F3B"
GOLD, GOLD_LIGHT = "#C59940", "#E3BE6B"
INK, INK_SOFT, CREAM = "#0F2324", "#33494A", "#F9F6ED"
WALL, WALL_SHADE, SLATE, WINDOW = "#EFE2C2", "#DCCA9D", "#4B6B6E", "#35585A"
HALL, HALL_SHADE, HALL_ROOF = "#E6D5A9", "#CDB685", "#42636A"
BOW_DARK = "#C8962A"


def font_ttf() -> Path:
    src = ROOT / "app/fonts/bricolage-grotesque-latin-standard-normal.woff2"
    out = Path(tempfile.gettempdir()) / "bricolage-grotesque.ttf"
    font = TTFont(src)
    font.flavor = None
    font.save(out)
    return out


def bricolage(path: Path, size: int, opsz: float, wght: float, wdth: float):
    font = ImageFont.truetype(str(path), size * S)
    font.set_variation_by_axes([opsz, wght, wdth])
    return font


def s(v: float) -> int:
    return round(v * S)


def tracked(d, xy, text, font, fill, track_em):
    """Texte avec approche resserrée (Pillow n'applique pas letter-spacing)."""
    x, y = xy
    size = font.size
    for i, ch in enumerate(text):
        d.text((x, y), ch, font=font, fill=fill)
        advance = font.getlength(text[: i + 1]) - font.getlength(text[:i])
        x += advance + track_em * size
    return x


# ——— Le symbole, relu dans logo.tsx ———


def parse_path(d: str, steps: int = 14):
    """Chemin SVG absolu (M, L, C, Z) → liste de polygones."""
    tokens = re.findall(r"[MLCZ]|-?\d+(?:\.\d+)?", d)
    polys, cur, pts, i = [], None, [], 0
    while i < len(tokens):
        t = tokens[i]
        if t == "M":
            cur = (float(tokens[i + 1]), float(tokens[i + 2]))
            pts = [cur]
            i += 3
        elif t == "L":
            cur = (float(tokens[i + 1]), float(tokens[i + 2]))
            pts.append(cur)
            i += 3
        elif t == "C":
            c = [float(v) for v in tokens[i + 1 : i + 7]]
            p0, p1, p2, p3 = cur, (c[0], c[1]), (c[2], c[3]), (c[4], c[5])
            for k in range(1, steps + 1):
                u = k / steps
                m = 1 - u
                pts.append(
                    tuple(
                        m**3 * p0[j] + 3 * m**2 * u * p1[j] + 3 * m * u**2 * p2[j] + u**3 * p3[j]
                        for j in range(2)
                    )
                )
            cur = p3
            i += 7
        else:  # Z
            polys.append(pts)
            i += 1
    return polys


def mark_data():
    logo = (ROOT / "components/brand/logo.tsx").read_text()
    light = re.search(r'const BOW_LIGHT =\s*"([^"]+)"', logo).group(1)
    dark = re.search(r'const BOW_DARK =\s*"([^"]+)"', logo).group(1)
    dots_src = re.search(r"const MARK_DOTS = \[(.*?)\] as const", logo, re.S).group(1)
    dots = [tuple(float(v) for v in m) for m in re.findall(r"\[([\d.]+), ([\d.]+), ([\d.]+)\]", dots_src)]
    bow = re.search(r"const MARK_BOW = \{ x: ([\d.]+), y: ([\d.]+), scale: ([\d.]+) \}", logo)
    return {
        "light": parse_path(light),
        "dark": parse_path(dark),
        "dots": dots,
        "bow": tuple(float(v) for v in bow.groups()),
    }


def draw_bow(d, mark, cx, cy, k):
    """Le nœud, centré en (cx, cy) ; k : échelle du repère du symbole."""
    for group, fill in ((mark["light"], GOLD_LIGHT), (mark["dark"], BOW_DARK)):
        for poly in group:
            d.polygon([(s(cx + (px - 64) * k), s(cy + (py - 53) * k)) for px, py in poly], fill=fill)


def draw_mark(d, mark, x0, y0, k):
    """Le symbole complet ; (x0, y0) : coin haut gauche du repère 12 27 102 72."""
    for x, y, r in mark["dots"]:
        cx, cy = x0 + (x - 12) * k, y0 + (y - 27) * k
        d.ellipse([s(cx - r * k), s(cy - r * k), s(cx + r * k), s(cy + r * k)], fill=GOLD)
    bx, by, bs = mark["bow"]
    draw_bow(d, mark, x0 + (bx - 12) * k, y0 + (by - 27) * k, k * bs)


def draw_gift(d, mark, x: float, y: float, w: float):
    body_h, lid_h, lid_w = w * 0.62, w * 0.2, w * 1.1
    top = y - body_h
    lid_top = top - lid_h + w * 0.02
    d.rounded_rectangle([s(x - w / 2), s(top), s(x + w / 2), s(y)], s(w * 0.04), fill=TEAL)
    d.rectangle([s(x + w / 2 - w * 0.15), s(top), s(x + w / 2), s(y)], fill="#13655E")
    d.rectangle([s(x - w * 0.08), s(top), s(x + w * 0.08), s(y)], fill=GOLD)
    d.rounded_rectangle(
        [s(x - lid_w / 2), s(lid_top), s(x + lid_w / 2), s(lid_top + lid_h)], s(w * 0.05), fill="#23897F"
    )
    d.rectangle([s(x - w * 0.08), s(lid_top), s(x + w * 0.08), s(lid_top + lid_h)], fill=GOLD_LIGHT)
    draw_bow(d, mark, x, lid_top - w * 0.03, w * 0.9 / 98)


# ——— La ville ———


def house(d, x, w, h, ground, floors, tint):
    top = ground - h
    roof = min(34, h / (floors + 0.4) * 1.2)
    d.polygon([(s(x - 2), s(top)), (s(x + 6), s(top - roof)), (s(x + w - 6), s(top - roof)), (s(x + w + 2), s(top))], fill=SLATE)
    d.rectangle([s(x), s(top), s(x + w), s(ground)], fill=tint)
    d.rectangle([s(x + w - 5), s(top), s(x + w), s(ground)], fill=WALL_SHADE)
    cols = max(2, int((w - 8) // 20))
    gap = (w - cols * 9) / (cols + 1)
    fh = h / (floors + 0.4)
    for f in range(floors):
        for c in range(cols):
            wx = x + gap + c * (9 + gap)
            wy = top + fh * 0.5 + f * fh
            d.rectangle([s(wx), s(wy), s(wx + 9), s(wy + fh * 0.5)], fill=WINDOW)


def town_hall(d, cx, ground):
    """L'hôtel de ville : corps à la Mansart, deux pavillons, horloge au centre."""
    # Corps central
    d.polygon([(s(cx - 100), s(ground - 92)), (s(cx - 92), s(ground - 118)), (s(cx + 92), s(ground - 118)), (s(cx + 100), s(ground - 92))], fill=HALL_ROOF)
    d.rectangle([s(cx - 98), s(ground - 94), s(cx + 98), s(ground)], fill=HALL)
    d.rectangle([s(cx - 100), s(ground - 96), s(cx + 100), s(ground - 91)], fill=HALL_SHADE)
    for dx in (-82, -64, -46, 38, 56, 74):
        d.rectangle([s(cx + dx), s(ground - 80), s(cx + dx + 9), s(ground - 57)], fill=WINDOW)
    for dx in (-78, -50, 44, 72):
        d.pieslice([s(cx + dx - 7), s(ground - 36), s(cx + dx + 7), s(ground - 22)], 180, 360, fill=WINDOW)
        d.rectangle([s(cx + dx - 7), s(ground - 29), s(cx + dx + 7), s(ground)], fill=WINDOW)
    # Pavillons d'angle
    for px in (cx - 120, cx + 120):
        d.polygon([(s(px - 26), s(ground - 108)), (s(px - 16), s(ground - 142)), (s(px + 16), s(ground - 142)), (s(px + 26), s(ground - 108))], fill=HALL_ROOF)
        d.rectangle([s(px - 23), s(ground - 110), s(px + 23), s(ground)], fill=HALL)
        d.rectangle([s(px + 10), s(ground - 110), s(px + 23), s(ground)], fill=HALL_SHADE)
        d.rectangle([s(px - 26), s(ground - 112), s(px + 26), s(ground - 107)], fill=HALL_SHADE)
        for dx in (-9, 4):
            d.rectangle([s(px + dx - 1), s(ground - 96), s(px + dx + 8), s(ground - 74)], fill=WINDOW)
            d.rectangle([s(px + dx - 1), s(ground - 62), s(px + dx + 8), s(ground - 40)], fill=WINDOW)
    # Campanile, fronton, avant-corps et horloge
    d.rectangle([s(cx - 6), s(ground - 162), s(cx + 6), s(ground - 140)], fill=HALL)
    d.pieslice([s(cx - 10), s(ground - 176), s(cx + 10), s(ground - 156)], 180, 360, fill=HALL_ROOF)
    d.polygon([(s(cx - 42), s(ground - 126)), (s(cx), s(ground - 148)), (s(cx + 42), s(ground - 126))], fill=HALL_SHADE)
    d.polygon([(s(cx - 33), s(ground - 128)), (s(cx), s(ground - 143)), (s(cx + 33), s(ground - 128))], fill=HALL)
    d.rectangle([s(cx - 36), s(ground - 128), s(cx + 36), s(ground)], fill=HALL)
    d.rectangle([s(cx + 22), s(ground - 128), s(cx + 36), s(ground)], fill=HALL_SHADE)
    d.rectangle([s(cx - 40), s(ground - 130), s(cx + 40), s(ground - 125)], fill=HALL_SHADE)
    cy = ground - 108
    d.ellipse([s(cx - 12), s(cy - 12), s(cx + 12), s(cy + 12)], fill=HALL_SHADE)
    d.ellipse([s(cx - 10), s(cy - 10), s(cx + 10), s(cy + 10)], fill=CREAM)
    for turns, length, width in ((9 + 5 / 60) / 12, 5, 2), (5 / 60, 7.5, 1.4):
        a = turns * math.tau - math.pi / 2
        d.line([(s(cx), s(cy)), (s(cx + math.cos(a) * length), s(cy + math.sin(a) * length))], fill=INK, width=s(width))
    for dx in (-19, 10):
        d.rectangle([s(cx + dx), s(ground - 86), s(cx + dx + 9), s(ground - 60)], fill=WINDOW)
    d.pieslice([s(cx - 14), s(ground - 46), s(cx + 14), s(ground - 18)], 180, 360, fill=WINDOW)
    d.rectangle([s(cx - 14), s(ground - 32), s(cx + 14), s(ground)], fill=WINDOW)


def ferris_wheel(d, cx, base, r):
    """La grande roue des quais, posée sur le quai du premier plan."""
    hub = base - r - 46
    # Jambes arrière, rayons, jantes
    for side in (-1, 1):
        d.polygon([(s(cx - 4 * side), s(hub)), (s(cx + 62 * side), s(base - 6)), (s(cx + 52 * side), s(base - 6)), (s(cx + 2 * side), s(hub + 10))], fill="#A88234")
    for i in range(16):
        a = i / 16 * math.tau
        d.line([(s(cx), s(hub)), (s(cx + math.cos(a) * (r - 6)), s(hub + math.sin(a) * (r - 6)))], fill="#A88234", width=s(2))
    d.ellipse([s(cx - r), s(hub - r), s(cx + r), s(hub + r)], outline=GOLD_LIGHT, width=s(7))
    d.ellipse([s(cx - r + 13), s(hub - r + 13), s(cx + r - 13), s(hub + r - 13)], outline=GOLD_LIGHT, width=s(3))
    for i in range(40):
        a0, a1 = i / 40 * math.tau, (i + 1) / 40 * math.tau
        r0, r1 = (r - 3, r - 12) if i % 2 == 0 else (r - 12, r - 3)
        d.line([(s(cx + math.cos(a0) * r0), s(hub + math.sin(a0) * r0)), (s(cx + math.cos(a1) * r1), s(hub + math.sin(a1) * r1))], fill=GOLD, width=s(1.6))
    # Nacelles
    colors = [TEAL, CREAM, TEAL_DEEP]
    for i in range(12):
        a = i / 12 * math.tau + math.pi / 12
        px, py = cx + math.cos(a) * r, hub + math.sin(a) * r
        d.rectangle([s(px - 1), s(py), s(px + 1), s(py + 8)], fill="#A88234")
        d.pieslice([s(px - 12), s(py + 4), s(px + 12), s(py + 18)], 180, 360, fill=GOLD)
        d.rounded_rectangle([s(px - 10), s(py + 11), s(px + 10), s(py + 27)], s(3), fill=colors[i % 3])
        d.rounded_rectangle([s(px - 7), s(py + 14), s(px + 7), s(py + 19)], s(1.5), fill=WINDOW)
    # Jambes avant, traverse, moyeu, quai d'embarquement
    for side in (-1, 1):
        d.polygon([(s(cx - 6 * side), s(hub)), (s(cx + 86 * side), s(base)), (s(cx + 72 * side), s(base)), (s(cx + 3 * side), s(hub + 12))], fill=GOLD)
    d.rounded_rectangle([s(cx - 60), s(base - 76), s(cx + 60), s(base - 70)], s(2), fill=GOLD)
    d.ellipse([s(cx - 14), s(hub - 14), s(cx + 14), s(hub + 14)], fill=GOLD)
    d.ellipse([s(cx - 6), s(hub - 6), s(cx + 6), s(hub + 6)], fill=GOLD_LIGHT)
    d.rounded_rectangle([s(cx - 100), s(base - 10), s(cx + 100), s(base)], s(2), fill="#A88234")


def main():
    ttf = font_ttf()
    mark = mark_data()
    img = Image.new("RGB", (W * S, H * S), CREAM)
    d = ImageDraw.Draw(img)

    # Ciel du matin
    for yy in range(H * S):
        t = yy / (H * S * 0.72)
        t = min(1, t)
        a, b = (0xC6, 0xE2, 0xDC), (0xF3, 0xEF, 0xDF)
        d.line([(0, yy), (W * S, yy)], fill=tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3)))

    # Soleil
    d.ellipse([s(1040 - 64), s(112 - 64), s(1040 + 64), s(112 + 64)], fill="#F1EBCF")
    d.ellipse([s(1040 - 38), s(112 - 38), s(1040 + 38), s(112 + 38)], fill="#F7E3A8")

    ground = 474
    # Silhouettes lointaines : collines, clocher, château d'eau
    d.rectangle([s(0), s(ground - 70), s(W), s(ground)], fill="#CFE4DE")
    d.rectangle([s(552), s(ground - 104), s(574), s(ground)], fill="#BBD8D0")
    d.polygon([(s(549), s(ground - 104)), (s(563), s(ground - 158)), (s(577), s(ground - 104))], fill="#BBD8D0")
    d.rectangle([s(1138), s(ground - 150), s(1152), s(ground)], fill="#BBD8D0")
    d.ellipse([s(1114), s(ground - 196), s(1176), s(ground - 146)], fill="#BBD8D0")
    d.pieslice([s(1122), s(ground - 214), s(1168), s(ground - 178)], 180, 360, fill="#BBD8D0")

    town_hall(d, 250, ground)

    # Façades de quai
    tints = [WALL, "#F5EBD5", "#E6D4AA"]
    xs = [-30, 380, 456, 534, 612, 690, 776, 856, 950, 1030, 1112]
    for i, x in enumerate(xs):
        w = 70 + (i * 13) % 24
        h = 70 + (i * 29) % 34
        house(d, x, w, h, ground, 3 if h < 110 else 4, tints[i % 3])

    # Arbres
    for tx, r in ((40, 20), (420, 18), (720, 22), (1000, 20), (1160, 18)):
        d.rectangle([s(tx - 2), s(ground - r * 1.2), s(tx + 2), s(ground)], fill="#5B4632")
        d.ellipse([s(tx - r), s(ground - r * 2.6), s(tx + r), s(ground - r * 0.6)], fill="#2B8177")
        d.ellipse([s(tx - r * 0.5), s(ground - r * 2.5), s(tx + r * 0.1), s(ground - r * 1.9)], fill="#46998D")

    # Quai, l'Orrin, quai du premier plan
    d.rectangle([s(0), s(ground), s(W), s(ground + 20)], fill="#D6C394")
    d.rectangle([s(0), s(ground + 20), s(W), s(ground + 76)], fill="#86BEB4")
    for x0, y0, wl in ((60, 504, 90), (300, 520, 60), (520, 500, 120), (780, 528, 80), (980, 508, 110), (180, 538, 70), (700, 540, 90)):
        d.rounded_rectangle([s(x0), s(y0), s(x0 + wl), s(y0 + 3)], s(1.5), fill="#B8DDD5")
    d.rectangle([s(0), s(ground + 76), s(W), s(ground + 86)], fill="#D5C399")
    d.rectangle([s(0), s(ground + 86), s(W), s(H)], fill="#ECE4CC")

    ferris_wheel(d, 900, 614, 196)

    # Route en pointillés et cadeau
    for i in range(0, 34):
        px = 40 + i * 15
        d.ellipse([s(px - 2.6), s(600 - 2.6), s(px + 2.6), s(600 + 2.6)], fill=GOLD)
    draw_gift(d, mark, 600, 606, 84)

    # Logo
    draw_mark(d, mark, 60, 34, 0.54)
    logo_font = bricolage(ttf, 34, 48, 800, 92)
    end = tracked(d, (s(120), s(46)), "Passe", logo_font, INK, -0.04)
    tracked(d, (end, s(46)), "line", logo_font, TEAL, -0.04)

    # Titre
    title = bricolage(ttf, 88, 96, 800, 90)
    for i, line in enumerate(("From your hands", "to theirs.")):
        tracked(d, (s(58), s(100 + i * 76)), line, title, INK, -0.045)
    sub = bricolage(ttf, 25, 18, 500, 100)
    d.text((s(62), s(270)), "By cargo bike or a neighbor, all across Wrenhaven.", font=sub, fill=INK_SOFT)

    img = img.resize((W, H), Image.LANCZOS)
    out = ROOT / "app/opengraph-image.png"
    img.save(out, optimize=True)
    print("écrit", out)


if __name__ == "__main__":
    main()

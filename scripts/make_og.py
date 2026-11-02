#!/usr/bin/env python3
"""Generate the 1200x630 social preview image."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630
BG = (6, 12, 22)
TEAL = (53, 201, 195)
BLUE = (106, 171, 255)
PURPLE = (179, 157, 255)
ORANGE = (255, 180, 84)
MUTED = (147, 167, 192)
WHITE = (234, 242, 251)

FONT_BOLD = "/usr/local/share/fonts/Inter-Bold.ttf"
FONT_REG = "/usr/local/share/fonts/Inter-Regular.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def glow(canvas: Image.Image, xy, radius, color, opacity=255):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse(
        (xy[0] - radius, xy[1] - radius, xy[0] + radius, xy[1] + radius),
        fill=(*color, opacity),
    )
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.62))
    canvas.alpha_composite(layer)


def main() -> None:
    canvas = Image.new("RGBA", (W, H), (*BG, 255))
    glow(canvas, (150, 40), 260, TEAL, 70)
    glow(canvas, (1080, 90), 300, PURPLE, 64)
    glow(canvas, (760, 640), 340, BLUE, 44)

    draw = ImageDraw.Draw(canvas)

    # Faint dot grid.
    for x in range(0, W, 22):
        for y in range(0, H, 22):
            draw.ellipse((x, y, x + 1, y + 1), fill=(130, 170, 215, 18))

    # Logo tile.
    tile = (72, 70, 168, 166)
    draw.rounded_rectangle(tile, radius=24, fill=(255, 255, 255, 238))
    mark = Image.open(ROOT / "public/logo-mark-512.png").convert("RGBA")
    mark.thumbnail((80, 80), Image.LANCZOS)
    canvas.alpha_composite(mark, (80, 78))

    mono = font(FONT_MONO, 18)
    draw.text((190, 84), "VIRALL  ·  ASGSR 2026", font=mono, fill=TEAL)
    draw.text((190, 112), "ISS SURFACE VIROME", font=mono, fill=MUTED)

    title = font(FONT_BOLD, 66)
    draw.text((72, 214), "The ISS surface virome,", font=title, fill=WHITE)
    draw.text((72, 290), "made explorable.", font=title, fill=TEAL)

    body = font(FONT_REG, 25)
    draw.text(
        (74, 388),
        "26 swabs · 3 flights · 819 species · 22 high-quality genomes",
        font=body,
        fill=MUTED,
    )

    # Stat cards.
    cards = [
        ("26", "samples"),
        ("819", "species"),
        ("128", "core species"),
        ("22", "genomes"),
    ]
    x = 72
    for value, label in cards:
        draw.rounded_rectangle((x, 458, x + 236, 558), radius=14, outline=(130, 170, 215, 60), width=1)
        draw.text((x + 18, 472), value, font=font(FONT_BOLD, 38), fill=WHITE)
        draw.text((x + 20, 521), label.upper(), font=font(FONT_MONO, 15), fill=MUTED)
        x += 254

    # Large faint mark on the right.
    big = Image.open(ROOT / "public/logo-mark-512.png").convert("RGBA")
    big.thumbnail((330, 330), Image.LANCZOS)
    faint = big.copy()
    alpha = faint.getchannel("A").point(lambda a: int(a * 0.26))
    faint.putalpha(alpha)
    canvas.alpha_composite(faint, (W - 360, 190))

    draw.rounded_rectangle((1, 1, W - 2, H - 2), radius=0, outline=(130, 170, 215, 40), width=2)

    out = ROOT / "public/og.png"
    canvas.convert("RGB").save(out, optimize=True)
    print(f"Wrote {out} ({W}x{H})")


if __name__ == "__main__":
    main()

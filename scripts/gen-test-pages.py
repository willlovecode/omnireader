#!/usr/bin/env python3
"""Generates placeholder chapter page images for step-1 ImageReader testing.

Run with: python3 scripts/gen-test-pages.py
Output goes to assets/test-manga/<demo-id>/NNN.png and is bundled into the
app via require() in src/reader/ImageReader/testFixtures.ts. Not used at
runtime by the app itself.
"""

import os

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 720, 1080
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "test-manga")

DEMOS = {
    "demo-a": {"pages": 10, "hue": (46, 92, 176)},   # blue-ish
    "demo-b": {"pages": 8, "hue": (176, 64, 58)},    # red-ish
}


def shade(base, i, total):
    factor = 0.55 + 0.45 * (i / max(total - 1, 1))
    return tuple(min(255, int(c * factor)) for c in base)


def font(size):
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main():
    for demo_id, cfg in DEMOS.items():
        demo_dir = os.path.join(OUT_DIR, demo_id)
        os.makedirs(demo_dir, exist_ok=True)
        total = cfg["pages"]
        for i in range(1, total + 1):
            img = Image.new("RGB", (WIDTH, HEIGHT), shade(cfg["hue"], i - 1, total))
            draw = ImageDraw.Draw(img)
            label = f"{demo_id}\nPAGE {i}/{total}"
            f = font(72)
            bbox = draw.multiline_textbbox((0, 0), label, font=f, align="center")
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
            draw.multiline_text(
                ((WIDTH - tw) / 2, (HEIGHT - th) / 2),
                label,
                font=f,
                fill=(255, 255, 255),
                align="center",
            )
            path = os.path.join(demo_dir, f"{i:03d}.png")
            img.save(path)
        print(f"wrote {total} pages to {demo_dir}")


if __name__ == "__main__":
    main()

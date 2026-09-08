#!/usr/bin/env python3
"""Build window PNGs from Figma 2× exports.

Desktop: crop exact frames from desktop-container composite (teal bg baked in).
Selection/Processing: individual node export → gray canvas edge-flood → aspect-fit on #F7F7F7.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

PARTS = Path(__file__).resolve().parents[1] / "public" / "assets" / "parts"
SRC = PARTS / "_src"
SCALE = 2
GRAY_BG = (247, 247, 247, 255)


def crop(composite: Image.Image, x: float, y: float, w: float, h: float) -> Image.Image:
    s = SCALE
    return composite.crop((int(x * s), int(y * s), int((x + w) * s), int((y + h) * s)))


def is_canvas(r: int, g: int, b: int, a: int) -> bool:
    if a < 10:
        return True
    if abs(r - 247) <= 5 and abs(g - 247) <= 5 and abs(b - 247) <= 5:
        return True
    if abs(r - 238) <= 5 and abs(g - 240) <= 5 and abs(b - 242) <= 5:
        return True
    return False


def edge_flood(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    vis = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if is_canvas(*px[x, y]):
                vis[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not vis[y][x] and is_canvas(*px[x, y]):
                vis[y][x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        px[x, y] = (px[x, y][0], px[x, y][1], px[x, y][2], 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not vis[ny][nx] and is_canvas(*px[nx, ny]):
                vis[ny][nx] = True
                q.append((nx, ny))
    return im


def fit_canvas(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    bb = im.getbbox()
    if bb:
        im = im.crop(bb)
    im.thumbnail(size, Image.LANCZOS)
    canvas = Image.new("RGBA", size, GRAY_BG)
    ox = (size[0] - im.width) // 2
    oy = (size[1] - im.height) // 2
    canvas.paste(im, (ox, oy), im)
    return canvas


def process_export(src_name: str, out_name: str, size: tuple[int, int]) -> None:
    im = fit_canvas(edge_flood(Image.open(SRC / src_name)), size)
    im.save(PARTS / out_name)
    print(f"  {out_name} {size}")


def main() -> None:
    desktop = Image.open(SRC / "desktop-container-2x.png")
    for name, rect in {
        "win-messages.png": (236, 198, 238, 226),
        "win-excel-top.png": (500, 124, 546, 337),
        "win-safari.png": (1010, 254, 401, 353),
        "win-ecnl.png": (796, 430, 401, 369),
    }.items():
        crop(desktop, *rect).save(PARTS / name)
        print(f"desktop {name}")

    desktop.crop((0, 0, desktop.width, int(31 * SCALE))).save(PARTS / "desktop-menu.png")

    for src, out, size in [
        ("sel-mail-src.png", "sel-mail.png", (764, 572)),
        ("sel-excel-src.png", "sel-excel.png", (1218, 752)),
        ("sel-safari-src.png", "sel-safari.png", (896, 788)),
        ("sel-ecnl-src.png", "sel-ecnl.png", (894, 788)),
        ("proc-mail-src.png", "proc-mail.png", (874, 656)),
        ("proc-excel-src.png", "proc-excel.png", (1396, 862)),
        ("proc-safari-src.png", "proc-safari.png", (1026, 902)),
        ("proc-ecnl-src.png", "proc-ecnl.png", (1024, 902)),
    ]:
        if (SRC / src).exists():
            process_export(src, out, size)

    print("done — place Figma exports in public/assets/parts/_src/ first")


if __name__ == "__main__":
    main()

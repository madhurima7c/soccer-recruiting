#!/usr/bin/env python3
"""Strip Figma export matte/shadow halos; save tight RGBA window PNGs."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

PARTS = Path(__file__).resolve().parents[1] / "public" / "assets" / "parts"


def is_removable(r: int, g: int, b: int, a: int) -> bool:
    if a < 10:
        return True
    # Figma canvas + exported shadow matte (opaque blue-gray, not real UI)
    if r >= 188 and g >= 188 and b >= 188:
        return True
    if r >= 168 and g >= 182 and b >= 196 and abs(r - g) < 28 and abs(g - b) < 28:
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
            if is_removable(*px[x, y]):
                vis[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not vis[y][x] and is_removable(*px[x, y]):
                vis[y][x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        px[x, y] = (px[x, y][0], px[x, y][1], px[x, y][2], 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not vis[ny][nx] and is_removable(*px[nx, ny]):
                vis[ny][nx] = True
                q.append((nx, ny))
    return im


def process(src: Path, out: Path, size: tuple[int, int]) -> None:
    im = edge_flood(Image.open(src))
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im = im.resize(size, Image.LANCZOS)
    im.save(out)
    print(f"  {out.name} -> {size}")


def main() -> None:
    jobs = [
        ("win-messages-src.png", "win-messages.png", (476, 452)),
        ("win-excel-top-src.png", "win-excel-top.png", (1092, 674)),
        ("win-safari-src.png", "win-safari.png", (802, 706)),
        ("win-ecnl-src.png", "win-ecnl.png", (802, 738)),
        ("sel-mail-src.png", "sel-mail.png", (764, 572)),
        ("sel-excel-src.png", "sel-excel.png", (1218, 752)),
        ("sel-safari-src.png", "sel-safari.png", (896, 788)),
        ("sel-ecnl-src.png", "sel-ecnl.png", (894, 788)),
        ("proc-mail-src.png", "proc-mail.png", (874, 656)),
        ("proc-excel-src.png", "proc-excel.png", (1396, 862)),
        ("proc-safari-src.png", "proc-safari.png", (1026, 902)),
        ("proc-ecnl-src.png", "proc-ecnl.png", (1024, 902)),
    ]
    for src_name, out_name, size in jobs:
        src = PARTS / src_name
        if not src.exists():
            print(f"  skip missing {src_name}")
            continue
        process(src, PARTS / out_name, size)


if __name__ == "__main__":
    main()

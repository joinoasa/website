"""Render the brand images in public/ from og.html and icon.svg.

Usage (from the repo root):  python3 scripts/brand/render.py
Needs Python Playwright (with Chromium) and Pillow. Commit the outputs.
"""
import io
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
PUBLIC = HERE.parent.parent / "public"


def main() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630})
        page.goto((HERE / "og.html").as_uri())
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(300)
        page.screenshot(path=str(PUBLIC / "og.png"))

        icon = browser.new_page(viewport={"width": 512, "height": 512})
        svg = (HERE / "icon.svg").read_text()
        icon.set_content(
            f'<html><body style="margin:0;background:transparent">'
            f'<div style="width:512px;height:512px">{svg.replace("<svg ", "<svg width=512 height=512 ", 1)}</div></body></html>'
        )
        png = icon.screenshot(omit_background=True, clip={"x": 0, "y": 0, "width": 512, "height": 512})
        browser.close()

    master = Image.open(io.BytesIO(png)).convert("RGBA")
    # Flatten on white: apple-touch and maskable icons must be full-bleed (OS applies its own mask).
    flat = Image.new("RGBA", master.size, "#ffffff")
    flat.alpha_composite(master)
    flat = flat.convert("RGB")
    for name, size in (("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)):
        flat.resize((size, size), Image.LANCZOS).save(PUBLIC / name)
    master.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("wrote og.png, apple-touch-icon.png, icon-192.png, icon-512.png, favicon.ico")


if __name__ == "__main__":
    main()

"""Render the brand images in public/ from og.html, icon.svg and favicon.svg (copies from joinoasa/brand logos/oasa-logo/).

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
        def shot(name: str) -> bytes:
            # Open the SVG file itself; it scales to the 512 px viewport.
            icon.goto((HERE / name).as_uri())
            return icon.screenshot(omit_background=True, clip={"x": 0, "y": 0, "width": 512, "height": 512})

        icon_png = shot("icon.svg")        # full-bleed navy square
        fav_png = shot("favicon.svg")      # rounded navy square
        browser.close()

    # App icons: full-bleed (the OS applies its own mask); the mark sits inside the 80% safe zone.
    flat = Image.open(io.BytesIO(icon_png)).convert("RGB")
    for name, size in (("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)):
        flat.resize((size, size), Image.LANCZOS).save(PUBLIC / name)
    # Favicon: the rounded app icon, readable in light and dark browser tabs.
    Image.open(io.BytesIO(fav_png)).convert("RGBA").save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("wrote og.png, apple-touch-icon.png, icon-192.png, icon-512.png, favicon.ico")


if __name__ == "__main__":
    main()

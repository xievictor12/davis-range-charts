"""Turn the uploaded full-bleed chart PNGs into screen-sized WebPs.

The source files live in assets/ (not committed). Output goes to public/charts/.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets"
OUT = ROOT / "public" / "charts"

CHARTS = {
    "strings-written": "1f7f674e-f4e4-4066-b655-b3579146a1df",
    "voice-written": "053257d4-b5dd-4e30-803c-d1502fd22ce9",
    "flutes-written": "8975ba7c-0168-455a-bddd-8fd9d402b98e",
    "flutes-sounding": "1a3a9c26-307e-4d9b-94c5-ee8dfd971407",
    "clarinets-written": "e5c736bb-57b2-4adf-8232-eb4d521ea3d5",
    "clarinets-sounding": "ef08a76e-c58f-48db-bf4d-8e9b0d8979bd",
    "winds-written": "0a6ed280-967c-4763-915e-bc4eafa1d2e0",
    "winds-sounding": "7eb1ee68-0fa0-4c1b-9654-e377fd6b5d95",
    "saxophones-written": "5c43dfdd-ce61-4f59-9928-8a94ca684975",
    "saxophones-sounding": "eb7fce2d-e54e-47ea-b537-7f9664dbb67b",
    "brass-written": "a091383b-3531-43dc-9a4b-2885e33439e7",
    "brass-sounding": "ec9d932b-da7f-4b7e-b8de-590230ce7864",
    "percussion-written": "cdbd3bfd-0dd2-4db3-86cb-b3c93f7137fe",
    "percussion-sounding": "11b21fbc-0c05-401f-b1f3-9af55cf5178f",
    "keyboards-written": "1452cf77-1cbb-4c51-b39f-6ad92275070a",
    "keyboards-sounding": "f4e73e09-2feb-417f-a30a-774d50ed3d75",
    "guitars-written": "b8bdaa52-3500-4305-895c-fa9b9d17eaea",
    "guitars-sounding": "ac482581-ca5e-4edb-a637-fcd1ca910f30",
    "others-written": "f18cf635-43e2-4cf0-b012-cdc5669c3a14",
    "others-sounding": "b6e803b2-e7c3-447e-92c5-5f3c58ea2678",
}

TARGET_HEIGHT = 2000


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    missing = [name for name, stem in CHARTS.items() if not (SRC / f"{stem}.png").exists()]
    if missing:
        raise SystemExit(f"Missing source charts in assets/: {', '.join(missing)}")
    for name, stem in CHARTS.items():
        image = Image.open(SRC / f"{stem}.png").convert("RGB")
        width = round(image.width * TARGET_HEIGHT / image.height)
        image = image.resize((width, TARGET_HEIGHT), Image.Resampling.LANCZOS)
        image.save(OUT / f"{name}.webp", "WEBP", quality=82, method=4)
        print(name)


if __name__ == "__main__":
    main()

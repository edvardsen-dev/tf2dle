# TF2DLE Scripts

Python scrapers and image utilities for generating TF2DLE data. Scripts live in `src/` and write generated files to `output/`.

`output/` is a local ignored cache. After reviewing generated data/images, copy the relevant files into the app manually. See `docs/runbook.md` for the app update flow.

## Setup

```sh
cd scripts
uv sync
```

## Run

```sh
uv run python src/maps.py
uv run python src/weapons.py --limit 5 --dry-run
uv run python src/cosmetics.py --start-date 2025-01-01 --img-download
uv run python src/unusuals.py --start-date 2025-10-09
uv run python src/compress.py --path output/maps/images --ext png
```

## Common Scraper Args

| Arg | Description |
| --- | --- |
| `--start-date YYYY-MM-DD` | Include records released on or after the date. |
| `--img-download` | Download images for included records. Ignored by `--dry-run`. |
| `--dry-run` | Scrape and print a summary without writing JSON or images. |
| `--limit N` | Stop after N included records. Useful for testing. |

These args are supported by `maps.py`, `weapons.py`, `cosmetics.py`, and `unusuals.py`.

## Output

Scrapers write to `output/<name>/data.json`. Images, when enabled, are written under that scraper's output folder:

| Script | JSON | Images |
| --- | --- | --- |
| `maps.py` | `output/maps/data.json` | `output/maps/images/`, `output/maps/thumbnails/` |
| `weapons.py` | `output/weapons/data.json` | `output/weapons/images/`, `output/weapons/kill-icons/` |
| `cosmetics.py` | `output/cosmetics/data.json` | `output/cosmetics/images/` |
| `unusuals.py` | `output/unusuals/data.json` | `output/unusuals/images/` |
| `compress.py` | `output/compress/` | compressed copies from the requested input path |

If `output/<name>/data.json` already exists, scraper records with the same `name` are skipped and preserved. Scrapers save progress after each new record, so failed runs can usually be resumed by running the same command again. JSON output is sorted by `releaseDate` and `name` for deterministic diffs.

More detail: `docs/scrapers.md` and `docs/runbook.md`.

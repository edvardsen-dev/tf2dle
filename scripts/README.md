# TF2DLE Scripts

Python scrapers and image utilities for generating TF2DLE data. Scripts live in `src/` and write generated files to `output/`.

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

## Output

Scrapers write to `output/<name>/data.json`. Images, when enabled, are written under that scraper's output folder.

If `output/<name>/data.json` already exists, scraper records with the same `name` are skipped and preserved. Scrapers save progress after each new record, so failed runs can usually be resumed by running the same command again. JSON output is sorted by `releaseDate` and `name` for deterministic diffs.

More detail: `docs/scrapers.md` and `docs/runbook.md`.

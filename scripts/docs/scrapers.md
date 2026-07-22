# Scrapers

Run all commands from `scripts/` with `uv run python src/<script>.py`.

## Shared Behavior

| Arg                       | Applies To                                 | Behavior                                                                                 |
| ------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `--start-date YYYY-MM-DD` | `maps`, `weapons`, `cosmetics`, `unusuals` | Keeps records released on or after the date. Unknown dates are skipped when this is set. |
| `--img-download`          | `maps`, `weapons`, `cosmetics`, `unusuals` | Downloads images only for included records.                                              |
| `--dry-run`               | all scripts                                | Performs scraping/selection work but does not write JSON or images.                      |
| `--limit N`               | all scripts                                | Stops after N included records or processed images.                                      |

Dates are normalized to `YYYY-MM-DD` in generated JSON. Output records are sorted by `releaseDate`, then `name`; unknown dates sort last.

Scrapers are incremental. If `output/<name>/data.json` exists, records with names already in that file are skipped and preserved in the next write. New records are flushed to `data.json` as they are scraped, so a failed run can usually be resumed by running the same command again. To force a full rebuild, remove that output file first.

Generated hash image IDs use a stable unsigned SHA-256-derived integer, so new generated filenames are deterministic and never start with `-`.

## `maps.py`

Scrapes official maps from the TF2 Wiki list of maps.

Output:

```text
output/maps/data.json
output/maps/images/<hash>.png
output/maps/thumbnails/<hash>.png
```

Collected fields: `name`, `thumbnail`, `image`, `gameModes`, `releaseDate`.

## `weapons.py`

Scrapes official weapons from the TF2 Wiki weapons table, then visits each weapon page for details.

Output:

```text
output/weapons/data.json
output/weapons/images/<weapon-name>.png
output/weapons/kill-icons/<weapon-name>.png
```

Collected fields: `name`, `link`, `image`, `killIcon`, `releaseDate`, `usedBy`, `slot`, `ammoLoaded`, `ammoCarried`, `reloadType`, `qualities`, `attributes`.

## `cosmetics.py`

Scrapes cosmetic lists by class, then visits each cosmetic page for release dates.

Output:

```text
output/cosmetics/data.json
output/cosmetics/images/<hash>.png
```

Collected fields: `name`, `image`, `usedBy`, `releaseDate`.

## `unusuals.py`

Scrapes unusual effects from the TF2 Wiki unusual table.

Output:

```text
output/unusuals/data.json
output/unusuals/images/<hash>.png
```

Collected fields: `name`, `image`, `series`, `type`, `releaseDate`.

The wiki table groups unusual effects by series/update, not exact per-effect release dates. `--start-date` uses the maintained `SERIES_RELEASE_DATES` mapping in `src/unusuals.py`.

## `compress.py`

Compresses images from a local folder into `output/compress/`.

Example:

```sh
uv run python src/compress.py --path output/maps/images --ext png --limit 10
```

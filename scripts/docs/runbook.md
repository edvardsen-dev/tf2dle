# Data Update Runbook

This project keeps generated script output separate from app data. Scripts write to `scripts/output/...`; app data is updated manually after review.

## Path 1: Full Refresh

Use this when rebuilding a dataset from scratch.

1. Install dependencies.

```sh
cd scripts
uv sync
```

2. Run the relevant scrapers without `--start-date`.

```sh
uv run python src/maps.py --img-download
uv run python src/weapons.py --img-download
uv run python src/cosmetics.py --img-download
uv run python src/unusuals.py --img-download
```

3. Review generated JSON and image counts under `scripts/output/`.

4. Copy JSON into the app data folder.

```text
scripts/output/maps/data.json -> src/lib/server/data/maps.json
scripts/output/weapons/data.json -> src/lib/server/data/weapons.json
scripts/output/cosmetics/data.json -> src/lib/server/data/cosmetics.json
scripts/output/unusuals/data.json -> src/lib/server/data/unusuals.json
```

5. Copy images into the app image folders.

```text
scripts/output/maps/images/* -> static/images/maps/originals/
scripts/output/maps/thumbnails/* -> static/images/maps/thumbnails/
scripts/output/weapons/images/* -> static/images/weapons/thumbnails/
scripts/output/cosmetics/images/* -> static/images/cosmetics/
scripts/output/unusuals/images/* -> static/images/unusuals/
```

6. Update `DATA_LAST_UPDATED` in `src/lib/appMetadata.ts` to the date the app data was refreshed.

7. Run the app checks from the repo root.

```sh
npm run check
```

## Path 2: Add New Records

Use this when app data already exists and you want the scripts to find missing records.

1. Seed `scripts/output/<name>/data.json` from the current app data if it is not already there.

```text
src/lib/server/data/maps.json -> scripts/output/maps/data.json
src/lib/server/data/weapons.json -> scripts/output/weapons/data.json
src/lib/server/data/cosmetics.json -> scripts/output/cosmetics/data.json
src/lib/server/data/unusuals.json -> scripts/output/unusuals/data.json
```

2. Dry-run the relevant scraper. Existing names in output are skipped automatically.

```sh
cd scripts
uv run python src/maps.py --dry-run
```

3. Run the scraper with image downloads after the dry run looks correct.

```sh
uv run python src/maps.py --img-download
```

If the command fails part way through, run the same command again. The scraper saves each new record to `scripts/output/<name>/data.json` as it progresses and skips records already present there.

4. Copy the updated `scripts/output/<name>/data.json` over the matching `src/lib/server/data/<name>.json` file after review.

5. Copy only the new image files into the matching `static/images/...` folder listed in the full refresh section.

6. Update `DATA_LAST_UPDATED` in `src/lib/appMetadata.ts` to the date the app data was refreshed.

7. Run checks and inspect the game mode that uses the changed data.

```sh
npm run check
```

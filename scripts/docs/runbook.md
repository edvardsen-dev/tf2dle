# Data Update Runbook

This project keeps generated script output separate from app data. Individual scrapers write to `scripts/output/...`. The automated incremental updater validates all output before copying additions into app data and proposing a review PR. Full refreshes remain manual.

## Automated Incremental Updates

The **Update Game Data** GitHub workflow runs on the first of every month at 06:17 UTC and can be started manually from `main`. Scheduled runs are best-effort, not guaranteed to start at the exact minute. GitHub can disable schedules in public repositories after 60 days without repository activity.

The workflow seeds all four scrapers from current `main`, runs them sequentially with image downloads, and validates additions before changing app files. It does not refresh existing records, remove records, merge PRs, publish releases, or deploy.

- No additions: a successful report with zero additions, no metadata update, and no PR.
- New records: one PR to `main` with new records, required PNGs, and `DATA_LAST_UPDATED` set to the UTC update date. The report lists counts, names, and unknown release dates.
- Scraper, image, or app-check failure: the workflow fails without creating a PR. Check the run logs and summary for the error.
- An update PR is already open: the workflow links to it and leaves its branch untouched. This is reported as awaiting review, not as no new data.

### Repository Setup

1. In **Settings > Actions > General > Workflow permissions**, enable **Allow GitHub Actions to create and approve pull requests**. The workflow needs repository and PR write access to publish its branch and PR; it never approves or merges PRs.
2. Keep required checks and your normal review process for `main`. With `GITHUB_TOKEN`, GitHub-created PR workflow runs may require approval from the PR page. Approve them and wait for the Test workflow, including integration tests, before merging.
3. Enable Actions failure notifications in your GitHub notification settings. Check the Actions summary if a scheduled run fails.

Each update uses a new branch under `automation/update-game-data/`. The workflow leaves open update PRs untouched, and never overwrites or force-pushes an existing branch. Delete the branch after merging or closing its PR as normal.

No additional secrets or production credentials are needed. The new workflow must be merged to `main` before its schedule and manual trigger are available. Start with a manual run after merging, then inspect the report and any resulting PR.

After review, merge the data PR and manually publish a release targeting the merged commit. Publishing a release triggers deployment; merging or pushing a tag alone does not.

### Run Locally

From `scripts/`:

```sh
uv sync --locked
uv run --locked python -m unittest discover -s tests -v
uv run --locked python src/update_app_data.py
```

The updater resets **only** `scripts/output/maps`, `weapons`, `cosmetics`, and `unusuals`, and overwrites `update-report.md`. Back up any unreviewed scraper output in those directories first. It preserves unrelated outputs such as `output/compress`. Do not run another scraper or updater in the same checkout concurrently.

It writes `scripts/output/update-report.md`. A successful run with additions updates local app files but does not commit or open a PR. Review the diff and run `pnpm check` from the repository root. Existing record order and JSON indentation are preserved, and new records are appended. The PR's existing Test workflow runs offline scraper tests, unit tests, and integration tests.

### Recovery

- A failed scrape is not a no-op. Fix the reported problem and rerun the complete updater. Each updater run starts from app data; individual scraper commands can still resume their own checkpoints.
- If PR creation fails after the branch push, inspect the branch and create its PR manually, or rerun after fixing repository permissions.
- Closing an unmerged PR does not exclude its records. They will be proposed again on a later run.
- A changed wiki layout, an unsafe filename, conflicting discoveries, or a non-PNG/invalid image fails validation and needs investigation. New unusual series with unknown dates are included with warnings for review.

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
pnpm check
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
pnpm check
```

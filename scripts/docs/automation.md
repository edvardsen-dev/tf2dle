# Automated Data Updates

The **Update Game Data** workflow seeds all four scrapers from app JSON, runs them sequentially with image downloads, validates additions, copies them into the app, and runs `pnpm check`. It preserves existing records and app record order. It does not refresh existing records, remove records, merge PRs, publish releases, or deploy.

## Schedule and Results

Scheduled runs use `main` on the first of every month at 06:17 UTC. GitHub schedules are best-effort and may be disabled in public repositories after 60 days without repository activity.

- No additions: a successful summary, no metadata change, and no PR.
- Additions: a PR to `main` containing new records, required PNGs, and an updated `DATA_LAST_UPDATED` UTC date. Its report lists counts, names, and unknown release dates.
- Scraper, image, or app-check failure: a failed run with no PR. Inspect the logs and summary.
- An automated update PR is already open: publishing runs link to it and leave it unchanged. Preview runs can still test the updater.

Each update uses a new branch under `automation/update-game-data/`. The workflow never force-pushes or overwrites an existing branch. Review the data and images, wait for PR checks, merge, and manually publish a release targeting the merged commit to deploy.

## Manual Runs After Merge

Open **Actions > Update Game Data > Run workflow** and select the branch to test. Leave **Create a data update PR** unchecked for a preview. Check it only when running from `main` to publish validated additions as a PR. Scheduled runs publish automatically when additions exist.

CLI equivalents:

```sh
gh workflow run update-data.yaml --ref "$(git branch --show-current)" -f create_pr=false
gh workflow run update-data.yaml --ref main -f create_pr=true
```

## Repository Setup

Before a publishing run, enable **Settings > Actions > General > Workflow permissions > Allow GitHub Actions to create and approve pull requests**. No additional secrets are required. The workflow never approves or merges PRs.

Bot-created PR workflows may require approval from the PR page. Approve them and wait for the Test workflow, including scraper, unit, and integration tests, before merging. Enable Actions failure notifications in your GitHub settings to notice broken scheduled runs.

## Run Locally

From `scripts/`:

```sh
uv sync --locked
uv run --locked python -m unittest discover -s tests -v
uv run --locked python src/update_app_data.py
```

The updater resets `scripts/output/maps`, `weapons`, `cosmetics`, and `unusuals`, and overwrites `output/update-report.md`. Back up unreviewed output in those directories first. Unrelated output such as `output/compress` is preserved. Do not run multiple scrapers or updaters in the same checkout concurrently.

A successful local run with additions modifies app files but does not commit or create a PR. Review the diff and run `pnpm check` from the repository root. Use a temporary checkout if you do not want to change your working files. For individual manual scraper commands, see [the runbook](runbook.md).

## Recovery

- Fix failed scraping or validation and rerun the complete updater. Each run starts from app data; individual scrapers can still resume their checkpoints.
- If PR creation fails after pushing a branch, inspect that branch and create its PR manually, or rerun after fixing permissions.
- Closing an unmerged data PR does not exclude its records. Later runs may propose them again.
- Changed wiki layouts, unsafe filenames, conflicting discoveries, and invalid/non-PNG images need investigation. Unknown release dates appear as review warnings rather than blocking additions.

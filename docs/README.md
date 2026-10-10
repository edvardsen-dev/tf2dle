# TF2DLE

A worlde like game for TF2. Inspired by [wordle](https://www.nytimes.com/games/wordle/index.html), [loldle](https://loldle.net/), and [smidle](https://smidle.net/).

## Structure

```
- docs/             # Documentation and command cheat-sheats

- prisma/           # Schema and migrations

- scripts/          # Python scripts for collecting tf2 data

- src/              # Sveltekit related filed
  - lib/
    - components/   # Global components
    - composables/  # Global composables
    - server/       # All server code
    - dtos.ts       # Types used between server and client
    - types.ts      # General types
  - routes/         # App routes
    - api/          # Api routes

- static            # Static sveltekit files

- tests             # E2E tests
```

## Getting started

Prerequisites

- Docker
- Node 24 LTS, matching `.nvmrc` and the production image

### Step by step

1. Add `.env` file. Look at `.env.example` for all the variables needed.
2. Install dependencies

```
pnpm install
```

3. Run local postgres with docker:

```
pnpm db:up
```

4. Generate prisma client

```
pnpm db:client
```

The script uses the installed Prisma CLI from the lockfile. CLI and client versions are pinned together; it does not download a newer CLI through `dlx`.

5. Apply prisma migration to your local database

```
pnpm db:migrate
```

6. Run application

```
pnpm dev
```

## Workflow

1. Create a new branch from main where you can develop your feature in piece. Remember to commit regularly!
2. Create a merge request to main when done. Make sure all workflows pass and wait for approval.
3. When approved, merge and delete the branch.

## Deployment

Publishing a GitHub release runs **Release**, which builds and publishes `ghcr.io/edvardsen-dev/tf2dle/sveltekit` with the release tag and `latest`, then calls the shared deployment workflow. The build pins `PUBLIC_CDN_URL` to the release commit SHA, so production image URLs match the app build. Local development serves images from `/images`.

To deploy an existing image or roll back, run **Deploy** from `main` in GitHub Actions and enter its exact version tag, including `v` if present. `latest` is not accepted. This workflow does not build or publish an image. The shared workflow authenticates to GHCR and checks the selected image's manifest on the Actions runner before connecting to the VM, so an inaccessible image fails before server files are changed. Both workflows use the current default branch's Compose file and deployment script.

Server deployments are serialized across both workflows. After the selected app image responds successfully on port 3010, deployment removes unused local images from this app's exact repository. Images referenced by running or stopped containers, images with tags or digest references under another repository, unrelated images, and database volumes are preserved. Existing dangling images without an identifiable repository are left alone. GHCR images are not deleted; deploying a removed local version pulls it again.

Rollback selects an older app image but reapplies the current Compose configuration and secrets to the whole stack. It can also pull a newer `postgres:14-alpine` image and recreate the database container. Prisma migrations run at app startup and are not reversed, so the selected version must be compatible with the current database. A failed startup check leaves old images available but does not automatically restore the previous container.

## Testing

### Prerequisites

Playwright browsers

```
pnpm exec playwright install
```

### Isolated integration database

Integration tests start their own production preview at `http://127.0.0.1:4173` and refuse to use a development database. Stop any preview already using that port. Tests run serially because API regression tests seed and inspect shared database rows.

Start a disposable PostgreSQL instance without mounting your development data:

```sh
docker run --detach --rm --name tf2dle-migration-postgres \
  -p 127.0.0.1:55432:5432 \
  -e POSTGRES_USER=tf2dle_test -e POSTGRES_PASSWORD=tf2dle_test \
  -e POSTGRES_DB=tf2dle_migration_test postgres:14-alpine
docker exec tf2dle-migration-postgres pg_isready -U tf2dle_test -d tf2dle_migration_test
```

Wait for `pg_isready` to report that it accepts connections. In the test shell, explicitly override local configuration before running migrations or tests:

```sh
export DATABASE_URL=postgresql://tf2dle_test:tf2dle_test@127.0.0.1:55432/tf2dle_migration_test
export ADMIN_PASSWORD=migration-test-password
export CRON_SECRET=migration-test-secret
export PUBLIC_CDN_URL=
export PUBLIC_APP_VERSION=test
pnpm db:client
pnpm db:migrate
pnpm build
pnpm check
pnpm test
```

The database guard permits only this database/user on loopback, on port 55432 locally or 5432 in CI. Test credentials are public fixtures, not deployment credentials. Stop only the disposable container when finished:

```sh
docker stop tf2dle-migration-postgres
```

### Test commands

```sh
# Integration tests, using the explicit environment above
pnpm test:integration

# With trace viewer
pnpm test:integration --trace on

# Specific test file
pnpm test:integration <filename.test.ts>

# Specific test based on name
pnpm test:integration -g "name of test"

# Unit tests, non-watch mode
pnpm test:unit

# Unit tests, watch mode
pnpm test:unit:watch

# All JavaScript tests
pnpm test
```

Run the offline Python suite from `scripts` with `uv run --locked python -m unittest discover -s tests -v`.

The tracked upgrade checklist is [toolchain-migration.md](plans/toolchain-migration.md).

Use [this](https://playwright.dev/docs/running-tests) for more info on flags to run with tests

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
- Node

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

> **Note:** The script pins the Prisma CLI version to avoid pulling a newer major version with breaking changes.

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

To deploy an existing image or roll back, run **Deploy** from `main` in GitHub Actions and enter its exact version tag, including `v` if present. `latest` is not accepted. This workflow does not build or publish an image, and a missing image fails before the app container is replaced. Both workflows use the current default branch's Compose file and deployment script.

Server deployments are serialized across both workflows. After the selected app image responds successfully on port 3010, deployment removes unused local images from this app's exact repository. Images referenced by running or stopped containers, images with tags or digest references under another repository, unrelated images, and database volumes are preserved. Existing dangling images without an identifiable repository are left alone. GHCR images are not deleted; deploying a removed local version pulls it again.

Rollback selects an older app image but reapplies the current Compose configuration and secrets to the whole stack. It can also pull a newer `postgres:14-alpine` image and recreate the database container. Prisma migrations run at app startup and are not reversed, so the selected version must be compatible with the current database. A failed startup check leaves old images available but does not automatically restore the previous container.

## Testing

### Prerequisites

Playwright browsers

```
pnpm exec playwright install
```

### Steps

Run development server

_**Note:** Make sure the dev server has optimized all the dependencies_

```
pnpm dev
```

Run tests

```ts
// Integration tests
pnpm test:integration

// With trace viewer
pnpm test:integration --trace on

// Specific test file
pnpm test:integration <filename.test.ts>

// Specific test based on name
pnpm test:integration -g "name of test"

// Unit tests
pnpm test:unit

// All tests
pnpm test
```

Use [this](https://playwright.dev/docs/running-tests) for more info on flags to run with tests

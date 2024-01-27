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
    - features/     # Features wrapped all in one palce
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
docker compose up -d
```

4. Generate prisma client

```
npx prisma generate
```

5. Apply prisma migration to your local database

```
npx prisma migrate deploy
```

6. Run application

```
pnpm dev
```

## Workflow

1. Create a new branch from main where you can develop your feature in piece. Remember to commit regularly!
2. Create a merge request to main when done. Make sure all workflows pass and wait for approval.
3. When approved, merge and delete the branch.

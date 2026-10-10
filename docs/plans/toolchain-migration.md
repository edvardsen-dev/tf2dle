# Toolchain migration plan

Created: 2026-10-10. This is a working checklist; update it after each verified increment.

## Scope and rules

Upgrade the runtime, Svelte/SvelteKit ecosystem, Prisma, and related tooling without changing game rules, persisted browser data, or production database contents. Preserve existing SQL migration history.

Use current stable, mutually compatible versions, not an unrestricted `latest` update. The expanded required scope is Node 24 LTS, npm 12.2.0, pnpm 12.10.1, Svelte 5.57.2 with all application components in runes syntax, SvelteKit 3.0.1, adapter-node 6, Vite 8, Vitest 5, TypeScript 7.0.2, Tailwind 4.3.3, and Prisma 7.10.0. Prisma's `latest` CLI points to an 8.0 release candidate, so explicitly select Prisma 7.

Kit and svelte-check still require the TS6 compiler API. Install Microsoft's TS6 compatibility package under `typescript` and the genuine TS7 package under `@typescript/native`; `tsc` must report version 7 and run in the completion gate alongside Svelte checking. Do not fake peer versions or disable diagnostics. Full runes conversion, Kit 3, and Tailwind 4 are now required, not optional. Prisma 8 and production PostgreSQL remain separate operational work. Do not upgrade an existing PostgreSQL volume by changing its image tag.

## Completion gate

A migration step is complete only after all of these pass on its resulting code and lockfile:

1. `pnpm build`.
2. `pnpm check`, with no errors or warnings.
3. `pnpm test:unit`, in non-watch mode.
4. `pnpm test:integration`, against an isolated PostgreSQL database and a fresh application server.
5. `uv run --locked python -m unittest discover -s tests -v`, from `scripts`, for the existing scraper suite.

Run generation and committed migrations before database-dependent checks. Use explicit test environment variables; never inherit a development or production database URL for regression tests. Formatting of changed files must also pass. Runtime and Prisma steps additionally require a production Docker image build and startup/migration smoke test against a disposable database. A failed or unavailable check leaves the step open, with the blocker recorded below. Do not mark completion from code changes alone.

Record versions, commands, test counts, and failures in the verification log. Run the gate between dependency groups, not just at the end of the entire migration.

## Step 0: baseline and regression coverage

Status: complete. All baseline gates passed with added regression coverage.

- [x] Make test scripts consistently use pnpm and make unit tests non-watch by default.
- [x] Fix the Playwright preview/base URL mismatch and prevent reuse of an unrelated running server.
- [x] Document a disposable database setup with a dedicated port, test-only credentials, and explicit environment variables.
- [x] Run the build, check, unit, browser, and Python suites before dependency upgrades; fix test harness issues without weakening assertions.
- [x] Add real-PostgreSQL regression coverage for persisted daily selection, UTC date handling, win increments, and compound-key metrics upserts. Guard any fixture deletion so it only runs against the dedicated test database.
- [x] Add admin login/session/logout regression coverage and UI coverage for settings/dialog behavior before UI-library changes.
- [x] Add build/type-check gates to shared CI. Locked CLI alignment remains in step 2.
- [x] Pass the complete gate with the additional tests.

## Step 1: supported Node LTS

Status: complete. Full gate and Node 24 production image smoke test passed.

- [x] Declare Node 24 support in `package.json` and add a local runtime version file.
- [x] Update both Docker stages from Node 20 to Node 24 LTS; use the same runtime policy in CI.
- [x] Keep package-manager versions consistent across manifest, Docker, and workflows. Upgrade pnpm in a separate verified increment if needed.
- [x] Keep the installed Prisma migration CLI in production dependencies and invoke it without runtime downloads. This prerequisite moved forward from step 2 after the Node image startup smoke test failed with `prisma: not found`.
- [x] Exclude local environment files from the Docker build context; build without local secrets.
- [x] Pass the complete gate on Node 24.
- [x] Build the production image and verify migration execution, HTTP readiness, and a database-backed request using an isolated database. Do not deploy to production.

## Step 2: Prisma version and CLI alignment

Status: complete. Full gate and offline production image smoke test passed.

- [x] Pin the Prisma 6 CLI and client to the same stable version as a staging step.
- [x] Replace `dlx`/`npx` version hardcodes with the installed, locked CLI in package scripts and CI.
- [x] Package the migration CLI deterministically for production, or introduce a separate migration image/job. Startup must not fetch an untracked CLI from npm.
- [x] Update Prisma command documentation.
- [x] Pass the complete gate and production image smoke test before changing Prisma major versions.

## Step 2a: npm and pnpm 12

Status: in progress. Added to the required scope in the continuation session.

- [ ] Install npm 12.2.0 and pnpm 12.10.1 locally, and pin the same versions in Docker and CI.
- [ ] Update package-manager declarations, dependency-build approvals, and lockfile using pnpm 12; prove frozen-lockfile installs work.
- [ ] Pass the complete gate and production image smoke test; verify actual npm/pnpm versions rather than only configuration values.

## Step 3: full Svelte 5 runes and UI migration

Status: pending. Depends on step 2.

- [ ] Install the compatible final Svelte 5/Kit 3/Vite/plugin/check/test-tool stack. Verify this coupled application increment together with step 4, because the new UI APIs and runes conversion are interdependent.
- [ ] Upgrade Testing Library and adapt test mounting, cleanup, and rerendering where needed.
- [ ] Upgrade or replace incompatible UI dependencies: bits-ui, cmdk-sv, mode-watcher, svelte-sonner, and icon components.
- [ ] Adapt checked-in UI wrappers and their consumers to supported APIs; preserve keyboard focus, Escape/close behavior, settings, and styling.
- [ ] Convert every application `.svelte` component to runes, snippets, and callback props. Remove legacy `export let`, `$:` declarations, slots, event directives, dispatchers, `$$Props`, and legacy dynamic-component syntax. Preserve existing store/localStorage contracts.
- [ ] Audit every component and enforce runes mode globally so no legacy component silently remains.
- [ ] Add regression coverage for all game modes, destructive settings confirmations, navigation, notifications, and mobile/desktop rendering as needed.
- [ ] Fix reactive error-page reads; exercise navigation and error recovery.
- [ ] Pass the complete gate and production image smoke test.

## Step 4: SvelteKit 3 and current build/test tooling

Status: pending. Depends on step 3.

- [ ] Review the current Kit 3 migration guide; run the official migrator on a clean, reviewable increment if useful.
- [ ] Move `svelte.config.js` configuration into the Vite plugin and update the Node adapter.
- [ ] Add package `#lib` imports and replace `$lib` references, including explicit module filenames/extensions, test mocks, and component-generator aliases.
- [ ] Replace `$app/stores` with `$app/state`; update reactive consumers and mocks rather than doing an import-only replacement.
- [ ] Update `$app/environment`, hook type imports, and TypeScript config/include/exclude settings.
- [ ] Replace adapter-node `ORIGIN` configuration with `paths.origin`; verify form posts and CSRF behavior behind the deployment proxy.
- [ ] Upgrade Vite, its Svelte plugin, Vitest, svelte-check, jsdom, and TypeScript. Use TS7 native `tsc` plus Microsoft's TS6 API compatibility package for Kit/Svelte tools; retain full Svelte diagnostics.
- [ ] Migrate Tailwind 4 with its Vite plugin, CSS theme/configuration, and current tailwind-merge/tailwind-variants. Preserve theme colors, utility behavior, dialogs, focus styling, and responsive layouts.
- [ ] Review removed/deprecated error, navigation, environment, and response APIs actually used by this app.
- [ ] Pass the complete gate and production image smoke test, including admin form submissions and real Prisma queries with the new bundler.

## Step 5: stable Prisma 7

Status: pending. Depends on step 4; may be done independently after step 2 if framework work is paused.

- [ ] Install matching stable Prisma CLI, client, and PostgreSQL adapter versions explicitly; do not install the Prisma 8 release candidate.
- [ ] Add root `prisma.config.ts`, explicit CLI environment loading, schema path, migration path, and database URL configuration.
- [ ] Switch to the supported client generator with explicit output; update client and generated-model imports, mocks, and ignored generated files.
- [ ] Initialize the shared client with the PostgreSQL driver adapter; choose explicit connection-pool/timeout behavior where required.
- [ ] Update generation and migration packaging for CI and Docker, including builds that have no live database connection.
- [ ] Apply preserved migrations to an empty disposable database, then test an upgrade against a restored disposable database with existing data and migration records.
- [ ] Pass the complete gate and production image smoke test. Verify date-only lookups, counts, metrics upserts, and admin persistence against real PostgreSQL.

## Step 6: smaller dependency maintenance

Status: pending. Run each group as its own verified increment.

- [ ] Refresh compatible patch/minor dependencies, Playwright browsers, formatting tools, and browser compatibility data.
- [ ] Replace the deprecated `@oslojs/crypto` random-integer helper with Node's supported crypto API, after adding tests for its exclusive upper bound and invalid inputs.
- [ ] npm/pnpm upgrades are required in step 2a, not optional maintenance.
- [ ] Review remaining deprecated/transitive packages and security advisories; document exceptions instead of forcing incompatible overrides.
- [ ] Pass the complete gate after each group.

## Step 7: PostgreSQL support deadline

Status: pending. Separate operational migration; PostgreSQL 14 support ends 2026-11-12.

- [ ] Confirm production database size, extensions, backup access, acceptable downtime, and restore procedure with the operator.
- [ ] Restore a backup into an isolated database and verify it before choosing dump/restore or `pg_upgrade` for PostgreSQL 18.
- [ ] Test all committed migrations and application regression tests on the target PostgreSQL version.
- [ ] Update CI and disposable/local database configurations once tested. Do not point an existing PostgreSQL 14 data directory at a newer image.
- [ ] Write a production cutover and rollback runbook, including backup verification and old-volume retention.
- [ ] Schedule production execution separately; mark the production task complete only after the operator verifies data and application behavior.

## Optional follow-ups

- [ ] Prisma 8 requires a separate query API, schema-contract, and migration-ownership assessment; it is not part of the requested stable Prisma 7 upgrade.
- [ ] Review GitHub Actions, Python/uv, and scraper dependencies separately; keep locked offline tests passing.

## Verification log

### Initial assessment

- Worktree clean before this migration.
- Local Node: 24.18.1; pnpm: 10.21.0; uv: 0.10.4; Docker available.
- Previous assessment ran `pnpm check`: 0 errors, 0 warnings; `pnpm exec vitest run`: 12 files, 55 tests passed.
- At assessment time, full baseline and additional regression coverage were not yet verified.

### Step 0: baseline verified

- `pnpm build` passed on the existing dependency versions. It still emits the pre-existing Kit/Svelte 4 `untrack` export warnings and stale Browserslist data notice; address these in the framework/tooling steps.
- `pnpm check` passed with 0 errors and 0 warnings.
- `pnpm test:unit` passed: 12 files, 55 tests.
- With the documented disposable database and explicit test environment, `pnpm test:integration --reporter=line` passed: 19 tests, including 5 new admin/settings/database regressions.
- `uv run --locked python -m unittest discover -s tests -v` passed: 33 tests.
- Prettier check of changed supported files passed.
- The first admin regression run failed because Playwright's API client did not send a Secure cookie over loopback HTTP. The authenticated assertion now uses browser fetch, matching the app; the full rerun passed without application changes.
- All 14 committed SQL migrations applied successfully to the disposable PostgreSQL 14 database. No development/production database or volume was changed.

### Step 1: Node LTS verified

- Docker now uses `node:24-alpine` in both stages; the built image reports Node 24.21.0. `.nvmrc`, package engines, and CI use the Node 24 major policy. Host checks ran on existing Node 24.18.1; no global runtime installation was changed.
- The first production startup failed with `prisma: not found`. Retaining the locked CLI as a production dependency and invoking its installed binary fixed startup; there is no npm CLI download at runtime.
- `.env` and `.env.*` are excluded from the build context. The successful image was built without local environment files; runtime checks confirmed `/app/.env` is absent and the migration binary exists.
- `pnpm check`: 0 errors, 0 warnings. `pnpm test:unit`: 55 passed. `pnpm test:integration --reporter=line`: 19 passed, including its fresh production build. Python suite: 33 passed. Changed-file formatting and `git diff --check` passed.
- `docker build --quiet --tag tf2dle-migration:node24 --build-arg PUBLIC_APP_VERSION=test .` passed. Startup applied the migration check with no pending migrations, `/` returned 200, and `/api/v1/game-modes/weapon` returned a numeric database-backed response.
- Concurrent Docker and host build/test runs exceeded startup/tool timeouts under resource contention. A longer preview startup allowance and sequential heavy verification completed successfully; test assertions were not relaxed.
- The disposable app container was stopped and removed after verification. No production deployment occurred.

### Step 2: Prisma 6 staging verified

- Prisma CLI and client are both pinned to 6.19.3. Package scripts and shared CI invoke the installed CLI; Docker retains it after production pruning.
- `pnpm install --frozen-lockfile` passed with the regenerated lockfile. Dependency install-script warnings remain because automatic Prisma scripts are not approved; explicit `pnpm db:client` generation and Docker generation both succeeded. Generation remains an explicit prerequisite, not an install-time side effect.
- `pnpm db:client` generated client 6.19.3. `pnpm db:migrate` verified all 14 existing migrations with no pending changes on the disposable database created by the old CLI.
- `pnpm check`: 0 errors, 0 warnings. `pnpm test:unit`: 55 passed. `pnpm test:integration --reporter=line`: 19 passed, including its fresh production build. Python suite: 33 passed. Changed-file formatting and `git diff --check` passed.
- `docker build --quiet --tag tf2dle-migration:prisma6 --build-arg PUBLIC_APP_VERSION=test .` passed without local `.env` files.
- The image started on a Docker internal network with internet access blocked. Migration execution succeeded; HTTP requests from inside the container returned 200 for `/` and the database-backed weapon endpoint. Prisma version output confirmed CLI/client 6.19.3, Node 24.21.0, and packaged Alpine ARM64 query/schema engines. Internal-network port forwarding was unavailable from the host, so this offline smoke check ran inside the container.
- No SQL schema/data migration was added, and no production data or deployment was changed.

## Current checkpoint

Steps 0, 1, and 2 are complete. The continuation session is implementing all requested application/toolchain upgrades, including full runes conversion, TS7 and Tailwind 4. Newly expanded steps remain open until the complete final gate passes. PostgreSQL production cutover and Prisma 8 remain outside this application migration.

The migration app container, internal network, and disposable database were stopped and removed after verification. Existing development containers, volumes, and databases were left untouched. Local build images and ignored test reports remain available; no images were published.

## References

- [Node release schedule](https://nodejs.org/en/about/previous-releases)
- [Svelte 5 migration](https://svelte.dev/docs/svelte/v5-migration-guide)
- [SvelteKit 3 migration](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
- [Prisma 7 migration](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [PostgreSQL support policy](https://www.postgresql.org/support/versioning/)

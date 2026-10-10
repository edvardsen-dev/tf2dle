# Prisma commands

Use the installed CLI, locked to the same version as the client. Do not run `prisma@latest` through `dlx` or `npx`; the latest tag can point to a different major version. The production image retains this CLI and runs committed migrations at startup without downloading dependencies.

Prisma CLI, client, and PostgreSQL adapter are pinned to `7.10.0`. The root `prisma.config.ts` loads `dotenv/config`, selects `prisma/schema.prisma` and `prisma/migrations`, and reads `DATABASE_URL`. The schema no longer contains the connection URL.

## Generate migration

```sh
pnpm exec prisma migrate dev --name <migration-name>
```

Set `DATABASE_URL` to a development database. This command requires a database connection and may reset development data. Prisma 7 does not generate the client after migrating; run `pnpm db:client` separately.

## Generate or update Prisma client

```sh
pnpm db:client
```

Generation does not require `DATABASE_URL` or a running database. The `prisma-client` generator writes ESM TypeScript files to `src/lib/server/generated/prisma`. Generate before type checking, tests, or building. Do not commit generated files.

Server code imports `PrismaClient` from `#lib/server/generated/prisma/client.ts`. Model-only imports use `import type` from `#lib/server/generated/prisma/browser.ts`, including types consumed by browser code. This entry point exports model names such as `AppNotification`; `models.ts` exports names such as `AppNotificationModel`. Never import the server client at runtime from browser code. TypeScript configuration must enable `allowImportingTsExtensions` for the explicit `.ts` imports.

## Deploy committed migrations

```sh
pnpm db:migrate
```

`DATABASE_URL` is required. This applies the committed SQL migrations without creating new ones or generating the client. The Prisma 7 upgrade does not alter the existing 14 migrations or model definitions.

## Runtime connection

The application creates `PrismaPg` using `process.env.DATABASE_URL` and fails if it is missing. The adapter pool allows 10 connections per process, waits up to 10 seconds for connection acquisition, and closes idle connections after 300 seconds. The acquisition and idle limits retain the old Prisma pool timeouts; the connection count is now fixed rather than CPU-dependent. The driver also uses the acquisition timeout for establishing connections, replacing Prisma's former 5-second connect timeout. Interactive transactions retain Prisma's defaults of 2 seconds to acquire a transaction and 5 seconds to run it.

Prisma URL options such as `connection_limit`, `pool_timeout`, and `connect_timeout` no longer configure the runtime pool. Configure it in `src/lib/server/prisma.ts`. TLS follows the connection URL and the PostgreSQL driver's certificate checks; the adapter does not disable SSL or certificate verification. SQL `date` fields must still round-trip as UTC midnight and match lookups with non-midnight inputs.

## Production image

Generate the client in the build stage before building the application. Retain `prisma`, `@prisma/client`, `@prisma/adapter-pg`, and `dotenv` as production dependencies. Copy the root `prisma.config.ts`, `prisma/schema.prisma`, and the full `prisma/migrations` directory into the final image so the installed CLI can run `prisma migrate deploy` at startup.

Include the generated client's runtime code in the application build or copy `src/lib/server/generated/prisma` into the final image if the build leaves external references to it. Keep its explicit `.ts` imports intact. Supply `DATABASE_URL` at runtime; do not bake environment files or credentials into the image.

## Disposable database checks

Use only the dedicated disposable database for migration regression checks:

```sh
DOTENV_CONFIG_PATH=/dev/null DATABASE_URL=postgresql://tf2dle_test:tf2dle_test@127.0.0.1:55432/tf2dle_migration_test pnpm db:migrate
```

`DOTENV_CONFIG_PATH=/dev/null` prevents these checks from loading a local environment file. The database integration test also refuses to mutate databases outside its dedicated local/CI URL guard.

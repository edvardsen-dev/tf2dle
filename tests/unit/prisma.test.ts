import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const { PrismaPg, PrismaClient } = vi.hoisted(() => ({
	PrismaPg: vi.fn(function () {}),
	PrismaClient: vi.fn(function () {})
}));

vi.mock('$app/env', () => ({ building: false }));

vi.mock('@prisma/adapter-pg', () => ({ PrismaPg }));
vi.mock('#lib/server/generated/prisma/client.ts', () => ({ PrismaClient }));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
});

afterEach(() => {
	vi.unstubAllEnvs();
});

test('constructs the client with the PostgreSQL adapter and bounded pool', async () => {
	const connectionString =
		'postgresql://tf2dle_test:tf2dle_test@127.0.0.1:55432/tf2dle_migration_test';
	vi.stubEnv('DATABASE_URL', connectionString);

	const { db } = await import('#lib/server/prisma.ts');

	expect(PrismaPg).toHaveBeenCalledExactlyOnceWith({
		connectionString,
		max: 10,
		connectionTimeoutMillis: 10_000,
		idleTimeoutMillis: 300_000
	});
	expect(PrismaClient).toHaveBeenCalledExactlyOnceWith({ adapter: PrismaPg.mock.instances[0] });
	expect(db).toBe(PrismaClient.mock.instances[0]);
});

test('rejects a missing URL before constructing the driver or client', async () => {
	vi.stubEnv('DATABASE_URL', undefined);

	await expect(import('#lib/server/prisma.ts')).rejects.toThrow(
		'DATABASE_URL is required to connect to the database'
	);
	expect(PrismaPg).not.toHaveBeenCalled();
	expect(PrismaClient).not.toHaveBeenCalled();
});

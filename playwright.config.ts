import type { PlaywrightTestConfig } from '@playwright/test';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Set DATABASE_URL to the dedicated integration test database');
const database = new URL(databaseUrl);
if (
	!['postgres:', 'postgresql:'].includes(database.protocol) ||
	database.username !== 'tf2dle_test' ||
	database.pathname !== '/tf2dle_migration_test' ||
	!['localhost', '127.0.0.1'].includes(database.hostname) ||
	!['5432', '55432'].includes(database.port)
) {
	throw new Error('Integration tests must use the dedicated local/CI test database');
}

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'pnpm build && pnpm preview --host 127.0.0.1',
		port: 4173,
		timeout: 180000,
		reuseExistingServer: false
	},
	testDir: 'tests/integration',
	workers: 1,
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		trace: 'on-first-retry',
		baseURL: 'http://127.0.0.1:4173',
		timezoneId: 'UTC'
	},
	reporter: 'html'
};

export default config;

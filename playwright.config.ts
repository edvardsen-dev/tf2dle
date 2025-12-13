import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'tests/integration',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		trace: 'on-first-retry',
		baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173'
	},
	reporter: 'html'
};

export default config;

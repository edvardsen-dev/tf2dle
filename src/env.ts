import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ADMIN_PASSWORD: { schema: (value) => value },
	PUBLIC_APP_VERSION: { public: true, static: true }
});

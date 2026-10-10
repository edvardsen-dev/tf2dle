import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: { path: 'prisma/migrations' },
	// Generation does not need a URL. Prisma requires it for migration commands.
	datasource: { url: process.env.DATABASE_URL }
});

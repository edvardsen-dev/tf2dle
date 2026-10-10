import { PrismaPg } from '@prisma/adapter-pg';
import { building } from '$app/env';
import { PrismaClient } from '#lib/server/generated/prisma/client.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString && !building) {
	throw new Error('DATABASE_URL is required to connect to the database');
}

const adapter = new PrismaPg({
	connectionString,
	max: 10,
	connectionTimeoutMillis: 10_000,
	idleTimeoutMillis: 300_000
});

export const db = new PrismaClient({ adapter });

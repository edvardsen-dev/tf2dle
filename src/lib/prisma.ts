import { DATABASE_URL } from '$env/static/private';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
	connectionString: DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

export const db = prisma;

import {
	getAdminPassword,
	isAdminAuthenticated,
	isAdminEnabled
} from '$lib/server/adminAuth';
import { db } from '$lib/server/prisma';
import { error, json, type RequestHandler } from '@sveltejs/kit';

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export const GET: RequestHandler = async ({ cookies, url }) => {
	const adminPassword = getAdminPassword();

	if (!isAdminEnabled(adminPassword)) {
		error(404, 'Not found');
	}

	if (!isAdminAuthenticated(cookies, adminPassword)) {
		error(401, 'Unauthorized');
	}

	const limit = normalizeLimit(url.searchParams.get('limit'));
	const afterId = normalizeCursor(url.searchParams.get('afterId'));
	const logs = await db.logs.findMany({
		where: afterId
			? {
					id: {
						lt: afterId
					}
				}
			: undefined,
		orderBy: {
			id: 'desc'
		},
		take: limit + 1
	});
	const items = logs.slice(0, limit).map((log) => ({
		id: log.id,
		createdAt: log.createdAt.toISOString(),
		event: log.event,
		message: log.message
	}));

	return json({
		items,
		nextCursor: items.at(-1)?.id ?? null,
		hasMore: logs.length > limit
	});
};

function normalizeLimit(value: string | null) {
	const limit = Number(value);

	if (!Number.isInteger(limit) || limit < 1) return DEFAULT_LIMIT;

	return Math.min(limit, MAX_LIMIT);
}

function normalizeCursor(value: string | null) {
	const cursor = Number(value);

	if (!Number.isInteger(cursor) || cursor < 1) return null;

	return cursor;
}

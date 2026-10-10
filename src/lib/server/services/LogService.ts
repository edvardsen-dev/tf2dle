import dayjs from '#lib/configs/dayjsConfig.ts';
import { db } from '#lib/server/prisma.ts';

class LogService {
	private constructor() {}

	/**
	 * Logs an event to the db
	 * @param event the event to log
	 * @param message that describes the event
	 */
	public static async log(event: string, message: string) {
		await db.logs.create({
			data: {
				createdAt: dayjs.utc().toDate(),
				event,
				message
			}
		});
	}
}

export default LogService;

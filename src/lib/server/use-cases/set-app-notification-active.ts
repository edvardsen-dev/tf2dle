import type { AppNotificationRepository } from '../repositories/AppNotificationRepository';

type UpdateAppNotificationRepo = Pick<
	AppNotificationRepository,
	'setEnabledState' | 'getAppNotification'
>;

type Dependencies = {
	repo: UpdateAppNotificationRepo;
};

type Input = {
	enabled: boolean;
};

type Result = { ok: true } | { ok: false; reason: 'db_error' } | { ok: false; reason: 'not_found' };

export async function setAppNotificationActive(deps: Dependencies, input: Input): Promise<Result> {
	try {
		const found = await deps.repo.getAppNotification();
		if (!found) {
			return { ok: false, reason: 'not_found' };
		}

		await deps.repo.setEnabledState(input.enabled);
	} catch (err) {
		console.log(err);
		return { ok: false, reason: 'db_error' };
	}
	return { ok: true };
}

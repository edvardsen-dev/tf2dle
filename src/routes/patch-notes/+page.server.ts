import MetricsService from '#lib/server/services/MetricsService.ts';

export const load = async () => {
	await MetricsService.recordPageView('/patch-notes');

	return {};
};

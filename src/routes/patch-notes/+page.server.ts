import MetricsService from '$lib/server/services/MetricsService';

export const load = async () => {
	await MetricsService.recordPageView('/patch-notes');

	return {};
};

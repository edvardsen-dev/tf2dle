import dayjs from '#lib/configs/dayjsConfig.ts';

export function getGameModeResetTime() {
	return dayjs.utc().endOf('day');
}

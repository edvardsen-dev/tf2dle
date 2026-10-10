import dayjs from '#lib/configs/dayjsConfig.ts';

export function isDecember() {
	return dayjs().month() === 11;
}

export function isHalloween() {
	return dayjs().month() === 9;
}

export function isWinter() {
	if (dayjs().month() === 11) return true;
	if (dayjs().month() === 0 && dayjs().date() < 15) return true;
	return false;
}

import dayjs from '$lib/configs/dayjsConfig';

export function isDecember() {
	return dayjs().month() === 11;
}

export function isWinter() {
	const month = dayjs().month();
	return month === 11 || month === 0 || month === 1;
}

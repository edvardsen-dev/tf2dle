import dayjs from '$lib/configs/dayjsConfig';
import { useLocalStorage } from '$lib/composables/useLocalStorage';
import type { GroupedUpdateDate, UpdateDate, UpdateEntry, UpdateMonth } from './types';
import update_2024_01_30 from './updates/update_2024_01_30';
import update_2024_02_03 from './updates/update_2024_02_03';
import update_2024_02_05 from './updates/update_2024_02_05';
import update_2024_02_06 from './updates/update_2024_02_06';
import update_2024_02_11 from './updates/update_2024_02_11';
import update_2024_02_14 from './updates/update_2024_02_14';
import update_2024_05_06 from './updates/update_2024_05_06';
import update_2024_06_03 from './updates/update_2024_06_03';
import update_2024_06_15 from './updates/update_2024_06_15';
import update_2024_06_23 from './updates/update_2024_06_23';
import update_2024_08_09 from './updates/update_2024_08_09';
import update_2024_10_06 from './updates/update_2024_10_06';
import update_2024_10_07 from './updates/update_2024_10_07';
import update_2024_10_18 from './updates/update_2024_10_18';
import update_2024_10_23 from './updates/update_2024_10_23';
import update_2025_01_07 from './updates/update_2025_01_07';
import update_2025_12_07 from './updates/update_2025_12_07';
import update_2026_07_24 from './updates/update_2026_07_24';

const updates = [
	update_2026_07_24,
	update_2025_12_07,
	update_2025_01_07,
	update_2024_10_23,
	update_2024_10_18,
	update_2024_10_07,
	update_2024_10_06,
	update_2024_08_09,
	update_2024_06_23,
	update_2024_06_15,
	update_2024_06_03,
	update_2024_05_06,
	update_2024_02_14,
	update_2024_02_11,
	update_2024_02_06,
	update_2024_02_05,
	update_2024_02_03,
	update_2024_01_30
] satisfies UpdateDate[];

export default updates;

export const updateMonths = groupUpdatesByMonth(updates);
export const latestUpdateId = updates.reduce((latest, update) => {
	const updateLatestId = update.revisions.reduce((revisionLatest, revision) => {
		return compareUpdateIds(revision.id, revisionLatest) > 0 ? revision.id : revisionLatest;
	}, '0.0');

	return compareUpdateIds(updateLatestId, latest) > 0 ? updateLatestId : latest;
}, '0.0');

export const lastViewedUpdate = useLocalStorage('last_viewed_update', '0.0');
export const muteUpdateNotifications = useLocalStorage('mute_update_notifications', false);

function groupUpdatesByMonth(updateDates: UpdateDate[]) {
	return updateDates.reduce<UpdateMonth[]>((months, updateDate) => {
		const groupedDate = groupUpdateDate(updateDate);

		if (!hasEntries(groupedDate)) return months;

		const monthId = dayjs(updateDate.date).format('YYYY-MM');
		const monthTitle = dayjs(updateDate.date).format('MMMM YYYY');
		let month = months.find((item) => item.id === monthId);

		if (!month) {
			month = {
				id: monthId,
				title: monthTitle,
				dates: []
			};
			months.push(month);
		}

		month.dates.push(groupedDate);

		return months;
	}, []);
}

function groupUpdateDate(updateDate: UpdateDate): GroupedUpdateDate {
	return updateDate.revisions.reduce<GroupedUpdateDate>(
		(groupedDate, revision) => {
			groupedDate.new.push(...(revision.new ?? []));
			groupedDate.improved.push(...(revision.improved ?? []));
			groupedDate.fixed.push(...(revision.fixed ?? []));

			return groupedDate;
		},
		{
			id: updateDate.date,
			title: dayjs(updateDate.date).format('D MMM YYYY'),
			new: [],
			improved: [],
			fixed: []
		}
	);
}

function hasEntries(groupedDate: GroupedUpdateDate) {
	return countEntries(groupedDate.new, groupedDate.improved, groupedDate.fixed) > 0;
}

function countEntries(...entries: UpdateEntry[][]) {
	return entries.reduce((count, items) => count + items.length, 0);
}

function compareUpdateIds(a: string, b: string) {
	const [dateA, revisionA = '0'] = a.split('.');
	const [dateB, revisionB = '0'] = b.split('.');
	const dateComparison = dateA.localeCompare(dateB);

	if (dateComparison !== 0) return dateComparison;

	return Number(revisionA) - Number(revisionB);
}

import type { Weapon } from '$lib/types';
import type { DailyWeaponsTwo } from '@prisma/client';
import type { Dayjs } from 'dayjs';

export interface WeaponTwoRepository {
	/**
	 * Finds the weapon that was selected for the given date
	 * @param date the date to get the weapon for
	 * @return the weapon found
	 */
	findWeapon(date: Dayjs): Promise<DailyWeaponsTwo | null>;

	/**
	 * Saves a weapon as the selected weapon for the current dat
	 * @param weapon to save
	 * @param date to save the weapon for
	 * @returns the saves weapon
	 */
	saveWeapon(weapon: Weapon, date: Dayjs): Promise<DailyWeaponsTwo>;

	/**
	 * Increments the number of correct guesses for the weapon
	 * selected for the given date
	 * @param date of the selected unusual to increment
	 */
	incrementNumberOfCorrectGuesses(date: Dayjs): Promise<void>;
}

import type { Weapon } from '$lib/types';
import type { Dayjs } from 'dayjs';

export interface WeaponRepository {
	/**
	 * Returns the name of weapon selected for the given date
	 * @param date the date to get the weapon for
	 * @returns the name of the weapon selected for the given date
	 */
	getWeapon(date: Dayjs): Promise<string | null>;

	/**
	 * Saves a weapon as the selected weapon for the current day
	 * @param weapon the weapon to save
	 */
	save(weapon: Weapon, date: Dayjs): Promise<void>;

	/**
	 * Returns how many have guessed the correct weapon for the current day
	 */
	getNumberOfCorrectGuesses(): Promise<number>;

	/**
	 * Increments the number of correct guesses for a given weapon
	 * @param date of the selected weapon to increment
	 */
	incrementNumberOfCorrectGuesses(date: Dayjs): Promise<void>;
}

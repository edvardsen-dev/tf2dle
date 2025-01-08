import type { Cosmetic } from '$lib/types';
import type { DailyCosmetics } from '@prisma/client';
import type { Dayjs } from 'dayjs';

export interface CosmeticRepository {
	/**
	 * Finds the cosmetic that is selected for the given date
	 * @param date the date to get the cosmetic for
	 * @return the selected cosmetic
	 */
	findCosmetic(date: Dayjs): Promise<DailyCosmetics | null>;

	/**
	 * Saves a cosmetic as the selected cosmetic for the current day
	 * @param cosmetic the cosmetic to save
	 * @param rotation the rotation to display the cosmetic (0, 90, 180, 270)
	 * @param date the date the cosmetic is selected for
	 */
	saveTodaysCosmetic(cosmetic: Cosmetic, rotation: number, date: Dayjs): Promise<DailyCosmetics>;

	/**
	 * Increments the number of correct guesses for a given cosmetic
	 * @param date of the selected cosmetic to increment
	 */
	incrementNumberOfCorrectGuesses(date: Dayjs): Promise<void>;
}

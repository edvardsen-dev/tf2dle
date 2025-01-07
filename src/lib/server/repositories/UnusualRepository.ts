import type { Unusual } from '$lib/types';
import type { DailyUnusuals } from '@prisma/client';
import type { Dayjs } from 'dayjs';

export interface UnusualRepository {
	/**
	 * Finds the unusual that was selected for the given date
	 * @param date the date to get the unusal for
	 * @return the unusual found
	 */
	findUnusual(date: Dayjs): Promise<DailyUnusuals | null>;

	/**
	 * Saves an unusual as the selected unusual for the current date
	 * @param unusual to save
	 * @param rotation to display the unusual (0, 90, 180, 270)
	 * @param date to save the unusual for
	 */
	saveUnusualForCurrentDate(
		unusual: Unusual,
		rotation: number,
		date: Dayjs
	): Promise<DailyUnusuals>;

	/**
	 * Increments the number of correct guesses for the unusual
	 * selected for the given date
	 * @param date of the selected unusual to increment
	 */
	incrementNumberOfCorrectGuesses(date: Dayjs): Promise<void>;
}

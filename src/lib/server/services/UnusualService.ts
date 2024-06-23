import type { Unusual } from '$lib/types';
import unusuals from '$lib/server/data/unusuals.json';
import type { UnusualRepository } from '../repositories/UnusualRepository';
import { unusualRepository } from '../repositories/UnusualRepositoryPrisma';
import type { Dayjs } from 'dayjs';
import LogService from './LogService';
import dayjs from '$lib/configs/dayjsConfig';

class UnusualService {
	private unusuals: Unusual[];
	private repo: UnusualRepository;

	constructor(repo: UnusualRepository) {
		this.unusuals = unusuals;
		this.repo = repo;
	}

	/**
	 * Returns all unusuals
	 * @returns array of all unusuals
	 */
	public getUnusuals() {
		return this.unusuals;
	}

	/**
	 * Returns the selected unusual for the given date
	 * @param date to get the unusual for
	 * @returns the unusual for the given date
	 */
	public async getUnusualByDay(date: Dayjs) {
		let unusual = await this.repo.findUnusual(date);

		if (!unusual) {
			unusual = await this.selectRandomUnusual();
		}

		return unusual;
	}

	/**
	 * Saves a random unusual that is set as the selected unusual
	 * for the current day
	 * @return the selected unusual
	 */
	private async selectRandomUnusual() {
		const randomIndex = Math.floor(Math.random() * this.unusuals.length);
		const randomRotation = Math.floor(Math.random() * 4) * 90;

		LogService.log(
			'Unusual',
			`Selected unusual: ${this.unusuals[randomIndex].name} with rotation ${randomRotation} degrees`
		);

		return this.repo.saveUnusualForCurrentDate(this.unusuals[randomIndex], randomRotation);
	}

	/**
	 * Validates a guess
	 * @param guess to validate
	 * @param numberOfGuesses number of tries the user has made
	 * @returns an object containing information abou the guess and if it was correct.
	 * A hint is provided if the user has made 9 or more guesses
	 */
	public async validateGuess(guess: string, numberOfGuesses: number) {
		const currentTime = dayjs.utc();

		const todaysUnusual = await this.getUnusualByDay(currentTime);
		const guessedUnusual = this.unusuals.find((unusual) => unusual.name === guess);

		let series: string | undefined;
		if (numberOfGuesses >= 9) {
			series = todaysUnusual.series;
		}

		const correct = guess === todaysUnusual.name;

		if (correct) {
			await this.repo.incrementNumberOfCorrectGuesses(currentTime);
		}

		return {
			name: guessedUnusual?.name ?? '',
			thumbnail: guessedUnusual?.image ?? '',
			correct,
			guessedAt: currentTime.format(),
			series
		};
	}
}

export const unusualService = new UnusualService(unusualRepository);

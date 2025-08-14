import weapons from '$lib/server/data/weapons.json';
import type { Weapon } from '$lib/types';
import { weaponRepository } from '$lib/server/repositories/WeaponRepositoryPrisma';
import type { WeaponRepository } from '$lib/server/repositories/WeaponRepository';
import LogService from './LogService';
import dayjs from '$lib/configs/dayjsConfig';
import type { Dayjs } from 'dayjs';
import { generateRandomNumber } from '../utils';

class WeaponService {
	private weapons: Weapon[];
	private repo: WeaponRepository;
	// Map used to convert usedBy values to a list of classes
	private usedByMap: Map<string, string[]>;

	constructor(repository: WeaponRepository) {
		this.weapons = weapons as Weapon[];
		this.repo = repository;
		this.usedByMap = new Map();

		this.usedByMap.set('All classes', [
			'Scout',
			'Soldier',
			'Pyro',
			'Demoman',
			'Heavy',
			'Engineer',
			'Medic',
			'Sniper',
			'Spy'
		]);
		this.usedByMap.set('All classes (except Engineer and Spy)', [
			'Scout',
			'Soldier',
			'Pyro',
			'Demoman',
			'Heavy',
			'Medic',
			'Sniper'
		]);
		this.usedByMap.set('All classes (except Spy)', [
			'Scout',
			'Soldier',
			'Pyro',
			'Demoman',
			'Heavy',
			'Engineer',
			'Medic',
			'Sniper'
		]);
	}

	/**
	 * Returns a list of all weapon names
	 * @returns a list of all weapon names
	 */
	public getWeaponNames() {
		return this.weapons.map((w) => w.name);
	}

	/**
	 * Extracts the year from a date string formatted: Month Day, Year Patch(name of patch)
	 * @param dateString date string to extract year from
	 * @returns the year as a number
	 */
	private extractYear(dateString: string) {
		if (dateString === 'unknown') return 2007;

		const regex = /\b\d{4}\b/;

		const match = dateString.match(regex);

		return match ? parseInt(match[0]) : 2007;
	}

	/**
	 * Checks if the guess matches today's weapon
	 * @param guess name of the weapon to check
	 * @returns a WeaponGuessResponse object
	 */
	public async validateGuess(guess: string) {
		const currentTime = dayjs.utc();

		const todaysWeapon = await this.getWeapon(currentTime);
		const guessedWeapon = this.weapons.find((w) => w.name === guess);

		if (!guessedWeapon || !todaysWeapon) {
			throw new Error('Could not find weapon with name ' + guess);
		}

		// Validate guess
		const correct = todaysWeapon.name === guess;

		if (correct) {
			await this.repo.incrementNumberOfCorrectGuesses(currentTime);
		}

		// Validate release year
		const guessedReleseYear = this.extractYear(guessedWeapon.releaseDate);
		const todaysReleaseYear = this.extractYear(todaysWeapon.releaseDate);
		const releaseDateStatus =
			guessedReleseYear === todaysReleaseYear
				? 'correct'
				: guessedReleseYear < todaysReleaseYear
					? 'later'
					: 'earlier';

		// Validate classes
		let usedByStatus: string;
		let guessedClasses: string[];
		let todaysClasses: string[];

		if (this.usedByMap.has(guessedWeapon.usedBy[0])) {
			guessedClasses = this.usedByMap.get(guessedWeapon.usedBy[0])!;
		} else {
			guessedClasses = guessedWeapon.usedBy;
		}

		if (this.usedByMap.has(todaysWeapon.usedBy[0])) {
			todaysClasses = this.usedByMap.get(todaysWeapon.usedBy[0])!;
		} else {
			todaysClasses = todaysWeapon.usedBy;
		}

		if (guessedClasses.join(',') === todaysClasses.join(',')) {
			usedByStatus = 'correct';
		} else if (guessedClasses.some((c) => todaysClasses.includes(c))) {
			usedByStatus = 'partial';
		} else {
			usedByStatus = 'incorrect';
		}

		// Validate slot
		let slotStatus: string;
		if (guessedWeapon.slot.join(',') === todaysWeapon.slot.join(',')) {
			slotStatus = 'correct';
		} else if (guessedWeapon.slot.some((s) => todaysWeapon.slot.includes(s))) {
			slotStatus = 'partial';
		} else {
			slotStatus = 'incorrect';
		}

		// Validate magazine size
		const magazineSizeStatus =
			guessedWeapon.ammoLoaded === todaysWeapon.ammoLoaded ? 'correct' : 'incorrect';

		// Validte qualities
		let qualitiesStatus: string;

		if (guessedWeapon.qualities.join(',') === todaysWeapon.qualities.join(',')) {
			qualitiesStatus = 'correct';
		} else if (guessedWeapon.qualities.some((q) => todaysWeapon.qualities.includes(q))) {
			qualitiesStatus = 'partial';
		} else {
			qualitiesStatus = 'incorrect';
		}

		return {
			correct,
			guessedAt: currentTime.format(),
			name: guess,
			numberOfCorrectGuesses: await this.repo.getNumberOfCorrectGuesses(),
			releaseDate: {
				status: releaseDateStatus,
				value: guessedReleseYear
			},
			usedBy: {
				status: usedByStatus,
				value: guessedClasses
			},
			slot: {
				status: slotStatus,
				value: guessedWeapon.slot
			},
			magazineSize: {
				status: magazineSizeStatus,
				value: guessedWeapon.ammoLoaded === null ? 'No ammo' : guessedWeapon.ammoLoaded
			},
			qualities: {
				status: qualitiesStatus,
				value: guessedWeapon.qualities
			}
		};
	}

	/**
	 * Returns the name of yesterdays weapon
	 *
	 * @returns name of yesterdays weapon
	 */
	public async getYesterdaysAnswer() {
		const yesterday = dayjs.utc().subtract(1, 'day');

		const weapon = await this.getWeapon(yesterday);

		return weapon!.name;
	}

	/**
	 * Returns the selected weapon for a given date
	 * @param date to get weapon for
	 * @returns name of todays weapon
	 */
	private async getWeapon(date: Dayjs) {
		let weapon = await this.repo.getWeapon(date);

		if (!weapon) {
			weapon = await this.selectNewRandomWeapon(date);
		}

		return this.weapons.find((w) => w.name === weapon);
	}

	/**
	 * Selects a new random weapon
	 * @returns the name of the selected weapon
	 */
	public async selectNewRandomWeapon(date: Dayjs) {
		const weapon = this.weapons[generateRandomNumber(this.weapons.length)];

		await this.repo.save(weapon, date);

		LogService.log('weapon', `Selected weapon: ${weapon.name}`);

		return weapon.name;
	}

	/**
	 * Returns the number of correct guesses for todays weapon
	 */
	public async getNumberOfCorrectGuesses() {
		return await this.repo.getNumberOfCorrectGuesses();
	}
}

export const weaponService = new WeaponService(weaponRepository);

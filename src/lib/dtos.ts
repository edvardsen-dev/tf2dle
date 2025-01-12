import type { WeaponAttribute } from './types';

export type SelectedMapDto = {
	image: {
		url: string;
		startingPos: {
			x: number;
			y: number;
		};
	};
	correctGuesses: number;
};

export type MapDto = {
	name: string;
	thumbnail: string;
};

export interface GuessResponse {
	correct: boolean;
	guessedAt: string;
}

export type MapGuessResponse = {
	correct: boolean;
	guessedAt: string;
	name: {
		status: 'correct' | 'incorrect';
		value: string;
	};
	gameModes: {
		status: 'correct' | 'incorrect' | 'partial';
		value: string[];
	};
	releaseDate: {
		status: 'correct' | 'earlier' | 'later';
		value: number;
	};
	thumbnail: string;
};

export interface WeaponGuessResponse extends GuessResponse {
	name: string;
	numberOfCorrectGuesses: number;
	releaseDate: {
		status: 'correct' | 'earlier' | 'later';
		value: string;
	};
	usedBy: {
		status: 'correct' | 'incorrect' | 'partial';
		value: string[];
	};
	slot: {
		status: 'correct' | 'incorrect' | 'partial';
		value: string[];
	};
	magazineSize: {
		status: 'correct' | 'incorrect';
		value: string;
	};
	qualities: {
		status: 'correct' | 'incorrect' | 'partial';
		value: string[];
	};
}

export interface WeaponTwoGuessResponse extends GuessResponse {
	name: string;
	attributes: WeaponAttribute[];
}

export interface WeaponTwoResponse {
	weapon: {
		numberOfTotalAttributes: number;
		attributes: {
			text: string;
			variant: 'positive' | 'negative' | 'neutral';
		}[];
	};
	numberOfCorrectGuesses: number;
}

export type CosmeticDto = {
	name: string;
	thumbnail: string;
};

export type CosmeticGuessResponse = {
	name: string;
	thumbnail: string;
	correct: boolean;
	guessedAt: string;
	usedBy?: string;
};

export type CurrentCosmeticDto = {
	cosmetic: {
		thumbnail: string;
		rotation: number;
	};
	numbersOfCorrectGuesses: number;
};

export interface UnusualGuessResponse extends GuessResponse {
	name: string;
	thumbnail: string;
	series?: string;
}

export type UnusualResponse = {
	name: string;
	thumbnail: string;
};

export type CurrentUnusualDto = {
	unusual: {
		thumbnail: string;
		rotation: number;
	};
	numberOfCorrectGuesses: number;
};

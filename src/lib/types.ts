export type Map = {
	name: string;
	thumbnail: string;
	image: string;
	gameModes: string[];
	releaseDate: string;
};

export type SelectedMap = {
	name: string;
	image: {
		url: string;
		startingPos: {
			x: number;
			y: number;
		};
	};
	gameModes: string[];
	releaseDate: string;
};

export type Weapon = {
	name: string;
	link: string;
	image: string;
	killIcon: string | null;
	releaseDate: string;
	usedBy: string[];
	slot: string[];
	ammoLoaded: string | null;
	ammoCarried: string | null;
	reloadType: string | null;
	qualities: string[];
	attributes: WeaponAttribute[];
};

export type WeaponAttribute = {
	text: string;
	variant: 'positive' | 'negative' | 'neutral';
};

export type Cosmetic = {
	name: string;
	image: string;
	usedBy: string;
};

export type Unusual = {
	name: string;
	image: string;
	series: string;
	type: string;
};

export enum NotificationLevel {
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'error'
}

export type AppNotification = {
	id: number;
	version: number;
	type: NotificationLevel;
	content: string;
};

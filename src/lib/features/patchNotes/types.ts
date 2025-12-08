export type PatchNote = {
	version: string;
	date: string;
	newFeatures: Change[];
	improvements: Change[];
	bugFixes: Change[];
};

export type Change = {
	title: string;
	description: string;
	gameMode: string | string[];
	author: {
		name: string;
		link: string;
	};
	reportedBy?: {
		user: {
			name: string;
			link: string;
		};
		note: string;
	};
};

export type UpdateDate = {
	date: string;
	revisions: UpdateRevision[];
};

export type UpdateRevision = {
	id: `${string}.${number}`;
	new?: UpdateEntry[];
	improved?: UpdateEntry[];
	fixed?: UpdateEntry[];
};

export type UpdateEntry = {
	title: string;
	description?: string;
	href?: string;
	gameModes?: string[];
	credit?: UpdateCredit;
};

export type UpdateCredit = {
	type: 'contribution' | 'report' | 'suggestion';
	user: UpdateCreditUser;
};

export type UpdateCreditUser = {
	name: string;
	link: string;
};

export type UpdateMonth = {
	id: string;
	title: string;
	dates: GroupedUpdateDate[];
};

export type GroupedUpdateDate = {
	id: string;
	title: string;
	new: UpdateEntry[];
	improved: UpdateEntry[];
	fixed: UpdateEntry[];
};

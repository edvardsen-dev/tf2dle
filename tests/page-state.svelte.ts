import type { page as appPage } from '$app/state';

type Page = typeof appPage;

export const page = $state<Page>({
	url: new URL('http://localhost/'),
	params: {},
	route: { id: '/' },
	status: 200,
	error: null,
	data: {},
	form: null,
	state: {},
	shallow: false
});

export function setPage(next: Partial<Page>) {
	Object.assign(page, next);
}

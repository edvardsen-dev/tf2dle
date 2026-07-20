export const CDN_URL = import.meta.env.DEV
	? '/images'
	: import.meta.env.PUBLIC_CDN_URL ||
		'https://cdn.jsdelivr.net/gh/edvardsen-dev/tf2dle@main/static/images';

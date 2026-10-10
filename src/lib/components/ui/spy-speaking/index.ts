import Root from './spy-speaking.svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';

type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet };

export {
	Root,
	type Props,
	//
	Root as SpySpeaking
};

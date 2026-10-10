import { useLocalStorage } from '#lib/composables/useLocalStorage.ts';

function useDiableExtraVisuals() {
	return useLocalStorage<boolean>('disable-extra-visuals', false);
}

export const disableExtraVisuals = useDiableExtraVisuals();

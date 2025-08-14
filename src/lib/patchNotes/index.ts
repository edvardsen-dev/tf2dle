import { useLocalStorage } from '$lib/composables/useLocalStorage';
import patch_0_1_0 from './patch_0_1_0';
import patch_0_2_0 from './patch_0_2_0';
import patch_1_0_0 from './patch_1_0_0';
import patch_1_1_0 from './patch_1_1_0';
import patch_1_2_0 from './patch_1_2_0';
import patch_1_3_0 from './patch_1_3_0';
import patch_1_3_1 from './patch_1_3_1';
import patch_1_4_0 from './patch_1_4_0';
import patch_1_5_0 from './patch_1_5_0';
import patch_1_6_0 from './patch_1_6_0';
import patch_1_6_1 from './patch_1_6_1';
import patch_1_7_0 from './patch_1_7_0';
import patch_1_7_1 from './patch_1_7_1';
import patch_1_7_2 from './patch_1_7_2';
import patch_1_7_3 from './patch_1_7_3';
import patch_1_7_4 from './patch_1_7_4';
import patch_1_7_5 from './patch_1_7_5';
import patch_1_7_6 from './patch_1_7_6';
import type { PatchNote } from './types';

const patchNotes = [
	patch_1_7_6,
	patch_1_7_5,
	patch_1_7_4,
	patch_1_7_3,
	patch_1_7_2,
	patch_1_7_1,
	patch_1_7_0,
	patch_1_6_1,
	patch_1_6_0,
	patch_1_5_0,
	patch_1_4_0,
	patch_1_3_1,
	patch_1_3_0,
	patch_1_2_0,
	patch_1_1_0,
	patch_1_0_0,
	patch_0_2_0,
	patch_0_1_0
] as PatchNote[];

export default patchNotes;

export const lastViewedPatchNote = useLocalStorage('last_viewed_patch_note', '0.0.1');

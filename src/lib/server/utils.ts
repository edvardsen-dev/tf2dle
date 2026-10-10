import { generateRandomIntegerNumber } from '@oslojs/crypto/random';
import { webcrypto } from 'node:crypto';

export function generateRandomNumber(max: number) {
	const randomNode = {
		read(bytes: Uint8Array) {
			webcrypto.getRandomValues(bytes);
		}
	};

	return generateRandomIntegerNumber(randomNode, max);
}

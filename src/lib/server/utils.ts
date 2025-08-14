import { generateRandomIntegerNumber } from "@oslojs/crypto/random"

export function generateRandomNumber(max: number) {
	const randomNode = {
		read(bytes: Uint8Array) {
			crypto.getRandomValues(bytes)
		}
	}

	return generateRandomIntegerNumber(randomNode, max)
}
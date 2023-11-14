export function randomInt(min: number, max: number, inclusive = true) {
	if (inclusive) max++
	else min++
	return Math.floor(Math.random() * (max - min)) + min
}

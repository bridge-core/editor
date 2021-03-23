export function wait(timeMs: number) {
	return new Promise<void>((resolve) => setTimeout(() => resolve(), timeMs))
}

declare module 'GameTest' {
	export function register(
		namespace: string,
		identifier: string,
		func: (test: Test) => void
	): TestRunner
}

declare interface TestRunner {
	maxTicks(ticks: number): TestRunner
	batch(time: 'night' | 'day'): TestRunner
}

declare interface Test {
	runAfterDelay(ticks: number, func: (test: Test) => void): void
	succeed(): void
	succeedWhen(func: (test: Test) => void): void
	succeedWhenActorPresent(id: string, x: number, y: number, z: number): void
	succeedWhenBlockPresent(id: string, x: number, y: number, z: number): void

	failIf(func: (test: Test) => void): void

	assertActorPresent(id: string, x: number, y: number, z: number): void
	assertActorNotPresent(id: string, x: number, y: number, z: number): void
	assertBlockPresent(id: string, x: number, y: number, z: number): void

	spawn(id: string, x: number, y: number, z: number): void
	setBlock(id: string, x: number, y: number, z: number): void
	pressButton(x: number, y: number, z: number): void
}

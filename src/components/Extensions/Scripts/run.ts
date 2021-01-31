const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor

export async function runAsync(script: string, env: Record<string, any>) {
	return await new AsyncFunction('Bridge', script)(env)
}

export function run(script: string, env: Record<string, any>) {
	return new Function('Bridge', script)(env)
}

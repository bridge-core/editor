const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor

export async function asyncExecute(script: string, env: Record<string, any>) {
	return await new AsyncFunction('Bridge', script)(env)
}

export function execute(script: string, env: Record<string, any>) {
	return new Function('Bridge', script)(env)
}

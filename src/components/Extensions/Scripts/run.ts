export function runAsync(
	script: string,
	env: unknown,
	envName = 'Bridge'
): Promise<any> {
	console.log(`return (async () => {\n${script}\n})()`)
	return new Function(envName, `return (async () => {\n${script}\n})()`)(env)
}

export function run(script: string, env: unknown, envName = 'Bridge') {
	return new Function(envName, script)(env)
}

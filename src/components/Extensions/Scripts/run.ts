export function runAsync(
	script: string,
	env: unknown | unknown[],
	envNames = ['Bridge']
): Promise<any> {
	return createRunner(
		script,
		envNames,
		true
	)(...(Array.isArray(env) ? env : [env]))
}

export function run(
	script: string,
	env: unknown | unknown[],
	envNames = ['Bridge']
) {
	return createRunner(script, envNames)(...(Array.isArray(env) ? env : [env]))
}

export function createRunner(
	script: string,
	envNames = ['Bridge'],
	async = false
) {
	if (async)
		return new Function(
			...envNames,
			`return (async () => {\n${script}\n})()`
		)
	return new Function(...envNames, script)
}

export function runAsync(
	script: string,
	env: unknown | unknown[],
	envNames = ['Bridge']
): Promise<any> {
	return new Function(...envNames, `return (async () => {\n${script}\n})()`)(
		...(Array.isArray(env) ? env : [env])
	)
}

export function run(
	script: string,
	env: unknown | unknown[],
	envName = ['Bridge']
) {
	return new Function(...envName, script)(
		...(Array.isArray(env) ? env : [env])
	)
}

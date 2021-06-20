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
	const transformedScript = transformScript(script)

	try {
		if (async)
			return new Function(
				...envNames,
				`return (async () => {\n${transformedScript}\n})()`
			)
		return new Function(...envNames, transformedScript)
	} catch (err) {
		console.error(script)
		throw new Error(`Error within script: ${err}`)
	}
}

export function transformScript(script: string) {
	return (
		script
			.replace(/export default /g, 'module.exports = ')
			// TODO: Support named exports
			// .replace(/export (var|const|let|function|class) /g, (substr) => {
			// 	return substr
			// })
			.replace(
				/import\s+(\* as [a-z][a-z0-9]*|[a-z][a-z0-9]+|{[a-z\s][a-z0-9,\s]*})\s+from\s+["'](.+)["']/gi,
				(_, imports, moduleName) => {
					if (imports.startsWith(`* as `))
						imports = imports.replace('* as ', '')
					return `const ${imports} = await require('${moduleName}')`
				}
			)
	)
}

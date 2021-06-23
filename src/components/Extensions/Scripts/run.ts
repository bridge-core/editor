import { transpile } from 'typescript'

export interface IScriptContext {
	script: string
	env: Record<string, unknown>
	language?: 'javaScript' | 'typeScript'
	async?: boolean
}

export function run(context: IScriptContext) {
	return createRunner(context)(...Object.values(context.env))
}

export function createRunner({
	script,
	env,
	language,
	async = false,
}: IScriptContext) {
	if (language === 'typeScript')
		script = transpile(script, {
			target: 99,
			isolatedModules: true,
		})
	let transformedScript = transformScript(script)

	try {
		if (async)
			return new Function(
				...Object.keys(env),
				`return (async () => {\n${transformedScript}\n})()`
			)
		return new Function(...Object.keys(env), transformedScript)
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

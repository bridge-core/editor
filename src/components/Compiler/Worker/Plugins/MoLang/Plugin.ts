import { TCompilerPluginFactory } from '../../TCompilerPluginFactory'
import { CustomMoLang, IExpression, MoLang, expressions } from 'molang'
import { setObjectAt } from '/@/utils/walkObject'
import json5 from 'json5'
import { run } from '/@/components/Extensions/Scripts/run'

export const MoLangPlugin: TCompilerPluginFactory<{
	include: Record<string, string[]>
	isFileRequest?: boolean
	mode: 'build' | 'dev'
}> = ({
	dataLoader,
	options: { include = {}, isFileRequest = false, mode } = {},
}) => {
	//Custom MoLang parser from https://github.com/bridge-core/MoLang
	const customMoLang = new CustomMoLang({})
	const isMoLangFile = (filePath: string | null) =>
		filePath?.endsWith('.molang')
	const isMoLangScript = (filePath: string | null) =>
		filePath?.startsWith('BP/scripts/molang/')
	const loadMoLangFrom = (filePath: string) =>
		Object.entries(include).find(([startPath]) =>
			filePath.startsWith(startPath)
		)?.[1]

	const astTransformers: ((
		expr: IExpression
	) => IExpression | undefined)[] = []

	return {
		async buildStart() {
			await dataLoader.fired

			// Load default MoLang locations and merge them with user defined locations
			include = Object.assign(
				await dataLoader.readJSON(
					'data/packages/minecraftBedrock/location/validMoLang.json'
				),
				include
			)
		},
		transformPath(filePath) {
			// MoLang files & MoLang scripts should get omitted from output
			if (isMoLangFile(filePath) || isMoLangScript(filePath)) return null
		},
		async read(filePath, fileHandle) {
			if (
				(isMoLangFile(filePath) || isMoLangScript(filePath)) &&
				fileHandle
			) {
				// Load MoLang files as text
				const file = await fileHandle.getFile()
				return await file.text()
			} else if (
				loadMoLangFrom(filePath) &&
				filePath.endsWith('.json') &&
				fileHandle
			) {
				// Currently, MoLang in function files is not supported so we can only load JSON files
				const file = await fileHandle.getFile()

				try {
					return json5.parse(await file.text())
				} catch (err) {
					if (!isFileRequest)
						console.error(`Error within file "${filePath}": ${err}`)
					return {
						__error__: `Failed to load original file: ${err}`,
					}
				}
			}
		},
		async load(filePath, fileContent) {
			if (isMoLangFile(filePath) && fileContent) {
				// Load the custom MoLang functions
				customMoLang.parse(fileContent)
			} else if (isMoLangScript(filePath)) {
				const module = { exports: {} }
				await run({
					script: fileContent,
					env: { module },
					async: true,
					modules: {
						'@molang/expressions': expressions,
						'@molang/core': MoLang,
						'@bridge/compiler': { mode },
					},
				})

				if (typeof module.exports === 'function')
					astTransformers.push(<any>module.exports)
			}
		},
		async require(filePath) {
			if (loadMoLangFrom(filePath)) {
				// Register molang files & molang scripts as JSON file dependencies
				return [
					'BP/scripts/molang/**/*.js',
					'BP/scripts/molang/**/*.ts',
					'*/molang/**/*.molang',
				]
			}
		},

		async transform(filePath, fileContent) {
			const includePaths = loadMoLangFrom(filePath)

			if (includePaths && includePaths.length > 0) {
				// For every MoLang location
				includePaths.forEach((includePath) =>
					// Search it inside of the JSON & transform it if it exists
					setObjectAt<string>(includePath, fileContent, (molang) => {
						if (typeof molang !== 'string') return molang
						// We don't want to transform entity events & slash commands inside of animations/animation controllers
						if (molang[0] === '/' || molang[0] === '@')
							return molang

						if (astTransformers.length > 0) {
							let ast: IExpression | undefined

							try {
								ast = customMoLang.parse(molang)
							} catch (err) {
								if (!isFileRequest)
									console.error(
										`Error within file "${filePath}"; script "${molang}": ${err}`
									)
								return molang
							}

							for (const transformer of astTransformers) {
								ast = ast.walk(transformer)
							}

							molang = ast.toString()
						}

						try {
							return customMoLang.transform(molang)
						} catch (err) {
							if (!isFileRequest)
								console.error(
									`Error within file "${filePath}"; script "${molang}": ${err}`
								)

							return molang
						}
					})
				)
			}
		},

		finalizeBuild(filePath, fileContent) {
			// Make sure JSON files are transformed back into a format that we can write to disk
			if (loadMoLangFrom(filePath) && typeof fileContent !== 'string')
				return JSON.stringify(fileContent, null, '\t')
		},
	}
}

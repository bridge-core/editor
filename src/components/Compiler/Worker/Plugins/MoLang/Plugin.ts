import { TCompilerPluginFactory } from '../../TCompilerPluginFactory'
import { CustomMoLang } from 'molang'
import { setObjectAt } from '/@/utils/walkObject'
import json5 from 'json5'

export const MoLangPlugin: TCompilerPluginFactory<{
	include: Record<string, string[]>
	isFileRequest?: boolean
}> = ({
	fileSystem,
	options: { include = {}, isFileRequest = false } = {},
}) => {
	//Custom MoLang parser from https://github.com/bridge-core/MoLang
	const customMoLang = new CustomMoLang({})
	const isMoLangFile = (filePath: string | null) =>
		filePath?.endsWith('.molang')
	const loadMoLangFrom = (filePath: string) =>
		Object.entries(include).find(([startPath]) =>
			filePath.startsWith(startPath)
		)?.[1]

	return {
		async buildStart() {
			// Load default MoLang locations and merge them with user defined locations
			include = Object.assign(
				await fileSystem.readJSON(
					'data/packages/minecraftBedrock/location/validMoLang.json'
				),
				include
			)
		},
		transformPath(filePath) {
			// MoLang files should get omitted from output
			if (isMoLangFile(filePath)) return null
		},
		async read(filePath, fileHandle) {
			if (isMoLangFile(filePath) && fileHandle) {
				// Load MoLang files as text
				const file = await fileHandle.getFile()
				return await file.text()
			} else if (loadMoLangFrom(filePath) && fileHandle) {
				// Currently, MoLang in function files is not supported so we can just load files as JSON
				const file = await fileHandle.getFile()

				try {
					return json5.parse(await file.text())
				} catch (err) {
					if (!isFileRequest) console.error(err)
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
			}
		},
		async require(filePath) {
			if (loadMoLangFrom(filePath)) {
				// Register molang files as JSON file dependencies
				return ['*/molang/**/*.molang']
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

						try {
							return customMoLang.transform(molang)
						} catch (err) {
							if (!isFileRequest) console.error(err)

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

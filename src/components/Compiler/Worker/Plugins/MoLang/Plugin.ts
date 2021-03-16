import { TCompilerPluginFactory } from '../../Plugins'
import { CustomMoLang } from 'molang'
import { setObjectAt } from '/@/utils/walkObject'
import json5 from 'json5'

export const MoLangPlugin: TCompilerPluginFactory<{
	include: Record<string, string[]>
}> = ({ options: { include = {} } = {} }) => {
	const customMoLang = new CustomMoLang({})
	const isMoLangFile = (filePath: string | null) =>
		filePath?.endsWith('.molang')
	const loadMoLangFrom = (filePath: string) =>
		Object.entries(include).find(([startPath]) =>
			filePath.startsWith(startPath)
		)?.[1]

	return {
		transformPath(filePath) {
			if (isMoLangFile(filePath)) return null
		},
		async read(filePath, fileHandle) {
			if (isMoLangFile(filePath) && fileHandle) {
				const file = await fileHandle.getFile()
				return await file.text()
			} else if (loadMoLangFrom(filePath) && fileHandle) {
				const file = await fileHandle.getFile()
				return json5.parse(await file.text())
			}
		},
		async load(filePath, fileContent) {
			if (isMoLangFile(filePath) && fileContent) {
				customMoLang.parse(fileContent)
			}
		},
		async require(filePath) {
			if (loadMoLangFrom(filePath)) {
				return ['*/molang/**/*.molang']
			}
		},

		async transform(filePath, fileContent) {
			const includePaths = loadMoLangFrom(filePath)
			console.log(includePaths, fileContent)
			if (includePaths && includePaths.length > 0) {
				includePaths.forEach((includePath) =>
					setObjectAt<string>(includePath, fileContent, (molang) => {
						console.log(molang, customMoLang.transform(molang))
						return customMoLang.transform(molang)
					})
				)
			}
		},

		finalizeBuild(filePath, fileContent) {
			if (loadMoLangFrom(filePath) && typeof fileContent !== 'string')
				return JSON.stringify(fileContent, null, '\t')
		},
	}
}

import { transpile } from 'typescript'
import { TCompilerPluginFactory } from '../Plugins'

export const TypeScriptPlugin: TCompilerPluginFactory = () => ({
	transformPath(filePath) {
		if (filePath.endsWith('.ts')) return filePath.slice(0, -3) + '.js'
	},
	async load(filePath, fileHandle) {
		if (filePath.endsWith('.ts')) {
			const file = await fileHandle.getFile()
			return await file.text()
		}
	},
	transform(filePath, fileContent) {
		if (filePath.endsWith('.ts')) {
			return transpile(fileContent, { target: 99, isolatedModules: true })
		}
	},
	finalizeBuild(filePath, fileContent) {
		if (filePath.endsWith('.ts')) return fileContent
	},
})

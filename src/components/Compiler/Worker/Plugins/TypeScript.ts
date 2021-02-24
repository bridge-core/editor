import { transpile } from 'typescript'
import { TCompilerPluginFactory } from '../Plugins'
import { hashString } from '/@/utils/hash'

export const TypeScriptPlugin: TCompilerPluginFactory = () => ({
	async transformPath(filePath) {
		if (filePath.endsWith('.ts')) {
			const hash = await hashString(filePath)
			return `${filePath.slice(0, -3)}_${hash.slice(0, 10)}.js`
		}
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

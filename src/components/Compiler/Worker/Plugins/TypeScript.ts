import { transpile } from 'typescript'
import { TCompilerPluginFactory } from '../TCompilerPluginFactory'
import { hashString } from '/@/utils/hash'

export const TypeScriptPlugin: TCompilerPluginFactory = () => ({
	async transformPath(filePath) {
		if (!filePath?.endsWith('.ts')) return

		const hash = await hashString(filePath)
		return `${filePath.slice(0, -3)}_${hash.slice(0, 4)}.ts.js`
	},
	async read(filePath, fileHandle) {
		if (!filePath.endsWith('.ts') || !fileHandle) return

		const file = await fileHandle.getFile()
		return await file.text()
	},
	load(filePath, fileContent) {
		if (!filePath.endsWith('.ts')) return

		return transpile(fileContent, {
			target: 99,
			isolatedModules: true,
		})
	},
	finalizeBuild(filePath, fileContent) {
		if (filePath.endsWith('.ts')) return fileContent
	},
})

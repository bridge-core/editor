import { transpile } from 'typescript'
import { TCompilerPluginFactory } from '../TCompilerPluginFactory'

export const TypeScriptPlugin: TCompilerPluginFactory = ({ options }) => ({
	async transformPath(filePath) {
		if (!filePath?.endsWith('.ts')) return

		return `${filePath.slice(0, -3)}.js`
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
			inlineSourceMap: options?.inlineSourceMap,
		})
	},
	finalizeBuild(filePath, fileContent) {
		/**
		 * We can only finalize the build if the fileContent type didn't change.
		 * This is necessary because e.g. custom component files need their own
		 * logic to be transformed from the Component instance back to a transpiled string
		 */
		if (filePath.endsWith('.ts') && typeof fileContent === 'string')
			return fileContent
	},
})

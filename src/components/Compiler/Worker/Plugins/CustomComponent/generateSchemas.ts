import { Component } from './Component'
import { App } from '/@/App'
import { iterateDir } from '/@/utils/iterateDir'

export async function generateComponentSchemas(fileType: string) {
	const app = await App.getApp()
	const v1CompatMode = app.project.config.get().bridge?.v1CompatMode ?? false
	const fromFilePath = v1CompatMode
		? `BP/components`
		: `BP/components/${fileType}`

	let baseDir: FileSystemDirectoryHandle
	try {
		baseDir = await app.project!.fileSystem.getDirectoryHandle(fromFilePath)
	} catch {
		return
	}

	const schemas: any = {}

	await iterateDir(
		baseDir,
		async (fileHandle, filePath) => {
			const [
				_,
				fileContent,
			] = await app.project.compilerManager.compileWithFile(
				filePath,
				await fileHandle.getFile()
			)
			const file = new File([fileContent], fileHandle.name)
			const component = new Component(
				fileType,
				await file.text(),
				'dev',
				v1CompatMode
			)

			const loadedCorrectly = await component.load('client')

			if (loadedCorrectly && component.name)
				schemas[component.name] = component.getSchema()
		},
		undefined,
		fromFilePath
	)

	return schemas
}

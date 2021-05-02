import { Component } from './Component'
import { App } from '/@/App'
import { iterateDir } from '/@/utils/iterateDir'

export async function generateComponentSchemas(fileType: string) {
	const app = await App.getApp()
	let baseDir: FileSystemDirectoryHandle
	try {
		baseDir = await app.project!.fileSystem.getDirectoryHandle(
			`BP/components/${fileType}`
		)
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
			const component = new Component(fileType, await file.text(), 'dev')

			await component.load('client')

			if (component.name) schemas[component.name] = component.getSchema()
		},
		undefined,
		`BP/components/${fileType}`
	)

	return schemas
}

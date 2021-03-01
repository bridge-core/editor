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

	await iterateDir(baseDir, async (fileHandle) => {
		const file = await fileHandle.getFile()
		const componentSrc = await file.text()
		const component = new Component(fileType, componentSrc)

		try {
			await component.load('client')
		} catch {
			return
		}

		if (component.name) schemas[component.name] = component.getSchema()
	})

	return schemas
}

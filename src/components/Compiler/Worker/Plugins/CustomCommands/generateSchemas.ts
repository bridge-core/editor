import { Command } from './Command'
import { App } from '/@/App'
import { iterateDir } from '/@/utils/iterateDir'

export async function generateCommandSchemas() {
	const app = await App.getApp()
	const v1CompatMode = app.project.config.get().bridge?.v1CompatMode ?? false
	const fromFilePath = `BP/commands`

	let baseDir: FileSystemDirectoryHandle
	try {
		baseDir = await app.project!.fileSystem.getDirectoryHandle(fromFilePath)
	} catch {
		return
	}

	const schemas: any[] = []

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
			const command = new Command(await file.text(), 'dev', v1CompatMode)

			await command.load('client')

			schemas.push(...command.getSchema())
		},
		undefined,
		fromFilePath
	)

	return schemas
}

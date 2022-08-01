import { Command, DefaultConsole } from 'dash-compiler'
import { App } from '/@/App'
import { JsRuntime } from '/@/components/Extensions/Scripts/JsRuntime'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { iterateDir } from '/@/utils/iterateDir'

export async function generateCommandSchemas() {
	const app = await App.getApp()
	const project = app.project
	const jsRuntime = new JsRuntime()
	await (await project.compilerService.completedStartUp).fired

	const v1CompatMode = project.config.get().bridge?.v1CompatMode ?? false
	const fromFilePath = project.config.resolvePackPath(
		'behaviorPack',
		'commands'
	)

	let baseDir: AnyDirectoryHandle
	try {
		baseDir = await app.fileSystem.getDirectoryHandle(fromFilePath)
	} catch {
		return []
	}

	const schemas: any[] = []

	await iterateDir(
		baseDir,
		async (fileHandle, filePath) => {
			const [_, fileContent] = await project.compilerService.compileFile(
				filePath,
				await fileHandle
					.getFile()
					.then(
						async (file) => new Uint8Array(await file.arrayBuffer())
					)
			)
			const file = new File([fileContent], fileHandle.name)
			const command = new Command(
				new DefaultConsole(),
				await file.text(),
				'development',
				v1CompatMode
			)

			await command.load(jsRuntime, filePath, 'client')

			schemas.push(...command.getSchema())
		},
		undefined,
		fromFilePath
	)

	return schemas
}

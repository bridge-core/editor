import { Command, DefaultConsole } from '@bridge-editor/dash-compiler'
import { App } from '/@/App'
import { JsRuntime } from '/@/components/Extensions/Scripts/JsRuntime'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { iterateDir, iterateDirParallel } from '/@/utils/iterateDir'

// TODO: Rewrite this to properly cache evaluated scripts until they are changed by the user
// See how it's done for custom components already!
export async function generateCommandSchemas() {
	const app = await App.getApp()
	const project = app.project
	const jsRuntime = new JsRuntime()
	await (
		await project.compilerService.completedStartUp
	).fired

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

	await iterateDirParallel(
		baseDir,
		async (fileHandle, filePath) => {
			let fileContent = await fileHandle
				.getFile()
				.then(async (file) => new Uint8Array(await file.arrayBuffer()))

			// Only transform file if it's a TypeScript file
			// TODO: Change back to always go through compiler pipeline once we cache the evaluated schemas
			// This is too slow at the moment
			if (filePath.endsWith('.ts')) {
				fileContent = (
					await project.compilerService.compileFile(
						filePath,
						fileContent
					)
				)[1]
			}

			const file = new File([fileContent], fileHandle.name)
			const command = new Command(
				new DefaultConsole(),
				await file.text(),
				'development',
				v1CompatMode
			)

			await command.load(jsRuntime, filePath, 'client').catch((err) => {
				console.error(`Failed to load command "${filePath}": ${err}`)
			})

			schemas.push(...command.getSchema())
		},
		undefined,
		fromFilePath
	)

	return schemas
}

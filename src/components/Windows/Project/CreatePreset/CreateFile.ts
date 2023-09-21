import { IPresetFileOpts } from './PresetWindow'
import { transformString } from './TransformString'
import { App } from '/@/App'
import { CombinedFileSystem } from '/@/components/FileSystem/CombinedFs'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { extname, dirname } from '/@/utils/path'

export type TCreateFile = [string, string, IPresetFileOpts?]

const textTransformFiles = [
	'.mcfunction',
	'.json',
	'.js',
	'.ts',
	'.txt',
	'.molang',
]

export async function createFile(
	presetPath: string,
	[originPath, destPath, opts]: TCreateFile,
	models: Record<string, unknown>
) {
	const app = await App.getApp()
	const fs = new CombinedFileSystem(
		app.fileSystem.baseDirectory,
		app.dataLoader
	)

	const inject = opts?.inject ?? []
	const fullOriginPath = `${presetPath}/${originPath}`
	const fullDestPath = transformString(
		app.projectConfig.resolvePackPath(opts?.packPath, destPath),
		inject,
		models
	)
	const ext = extname(fullDestPath)
	await fs.mkdir(dirname(fullDestPath), { recursive: true })

	let fileHandle: AnyFileHandle
	if (inject.length === 0 || !textTransformFiles.includes(ext)) {
		fileHandle = await fs.copyFile(fullOriginPath, fullDestPath)
	} else {
		const file = await fs.readFile(fullOriginPath)
		const fileText = await file.text()

		fileHandle = await fs.writeFile(
			fullDestPath,
			transformString(fileText, inject, models)
		)
	}

	return fileHandle
}

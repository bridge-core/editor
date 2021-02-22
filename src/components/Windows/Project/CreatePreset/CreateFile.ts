import { dirname } from 'path'
import { IPresetFileOpts } from './PresetWindow'
import { transformString } from './TransformString'
import { App } from '/@/App'
import { extname } from '/@/utils/path'

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
	const fs = app.fileSystem

	const inject = opts?.inject ?? []
	const fullOriginPath = `${presetPath}/${originPath}`
	const fullDestPath = transformString(
		`projects/${app.selectedProject}/${destPath}`,
		inject,
		models
	)
	const ext = extname(fullDestPath)
	await fs.mkdir(dirname(fullDestPath), { recursive: true })

	if (inject.length === 0 || !textTransformFiles.includes(ext)) {
		await fs.copyFile(fullOriginPath, fullDestPath)
	} else {
		const file = await fs.readFile(fullOriginPath)
		const fileText = await file.text()

		await fs.writeFile(
			fullDestPath,
			transformString(fileText, inject, models)
		)
	}

	return transformString(destPath, inject, models)
}

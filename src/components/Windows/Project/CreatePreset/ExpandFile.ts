import { IPresetFileOpts } from './PresetWindow'
import { transformString } from './TransformString'
import { App } from '/@/App'
import { deepMerge } from '/@/utils/deepmerge'
import { extname, dirname } from '/@/utils/path'

export type TExpandFile = [string, string, IPresetFileOpts?]

export async function expandFile(
	presetPath: string,
	[originPath, destPath, opts]: TExpandFile,
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

	let fileHandle: FileSystemFileHandle
	if (ext === '.json') {
		const json = await fs.readJSON(fullOriginPath)

		let destJson: any
		try {
			destJson = await fs.readJSON(fullDestPath)
		} catch {
			destJson = {}
		}

		fileHandle = await fs.writeFile(
			fullDestPath,
			transformString(
				JSON.stringify(deepMerge(destJson, json), null, '\t'),
				inject,
				models
			)
		)
	} else {
		const file = await fs.readFile(fullOriginPath)
		const fileText = await file.text()

		let destFileText: string
		try {
			destFileText = await (await fs.readFile(fullDestPath)).text()
		} catch {
			destFileText = ''
		}

		const outputFileText = transformString(fileText, inject, models)

		fileHandle = await fs.writeFile(
			fullDestPath,
			`${destFileText}${destFileText !== '' ? '\n' : ''}${outputFileText}`
		)
	}

	return fileHandle
}

import { IPresetFileOpts } from './PresetWindow'
import { transformString } from './TransformString'
import { App } from '/@/App'
import { CombinedFileSystem } from '/@/components/FileSystem/CombinedFs'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { deepMerge } from 'bridge-common-utils'
import { extname, dirname } from '/@/utils/path'

export type TExpandFile = [string, string, IPresetFileOpts?]

export async function expandFile(
	presetPath: string,
	[originPath, destPath, opts]: TExpandFile,
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
	if (ext === '.json') {
		const originFile = await fs.readFile(fullOriginPath)
		const jsonStr = transformString(await originFile.text(), inject, models)

		let destJson: any
		try {
			destJson = await fs.readJSON(fullDestPath)
		} catch {
			destJson = {}
		}

		fileHandle = await fs.writeFile(
			fullDestPath,
			JSON.stringify(deepMerge(destJson, JSON.parse(jsonStr)), null, '\t')
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

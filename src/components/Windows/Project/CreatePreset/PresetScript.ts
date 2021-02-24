import json5 from 'json5'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { IPermissions, IPresetFileOpts } from './PresetWindow'
import { transformString } from './TransformString'
import { App } from '/@/App'
import { run } from '/@/components/Extensions/Scripts/run'
import { deepmerge } from '/@/utils/deepmerge'

export async function runPresetScript(
	presetPath: string,
	presetScript: string,
	models: Record<string, unknown>,
	permissions: IPermissions
): Promise<string[]> {
	const app = await App.getApp()
	const fs = app.project?.fileSystem!
	const globalFs = app.fileSystem

	presetScript = presetScript.replaceAll(
		'./',
		presetPath.replace('data/packages/', '') + '/'
	)
	const script = await globalFs.readFile(`data/packages/${presetScript}`)
	const scriptSrc = await script.text()

	const module: any = {}
	try {
		run(scriptSrc, module, ['module'])
	} catch (err) {
		throw new Error(
			`Failed to execute PresetScript "${presetScript}": ${err}`
		)
	}

	if (typeof module.exports !== 'function')
		throw new Error(
			`Failed to execute PresetScript "${presetScript}": module.exports is of type ${typeof module.exports}`
		)

	const createdFiles: string[] = []
	const createJSONFile = (
		filePath: string,
		data: any,
		opts: IPresetFileOpts = { inject: [] }
	) => {
		if (typeof data !== 'string') data = JSON.stringify(data, null, '\t')
		return createFile(filePath, data, opts)
	}
	const createFile = async (
		filePath: string,
		data: FileSystemWriteChunkType,
		{ inject = [] }: IPresetFileOpts = { inject: [] }
	) => {
		// Permission not set yet, prompt user if necessary
		if (
			permissions.mayOverwriteFiles === undefined &&
			(await fs.fileExists(filePath))
		) {
			const confirmWindow = new ConfirmationWindow({
				description: 'windows.createPreset.overwriteFiles',
				confirmText: 'windows.createPreset.overwriteFilesConfirm',
			})

			const overwriteFiles = await confirmWindow.fired
			if (overwriteFiles) {
				// Stop file collision checks & continue creating preset
				permissions.mayOverwriteFiles = true
			} else {
				// Don't create file
				permissions.mayOverwriteFiles = false
				return
			}
		} else if (permissions.mayOverwriteFiles === false) {
			// Permission set, abort write
			return
		}

		createdFiles.push(filePath)
		const fileHandle = await fs.getFileHandle(filePath, true)
		fs.write(
			fileHandle,
			typeof data === 'string'
				? transformString(data, inject, models)
				: data
		)
	}
	const expandFile = async (
		filePath: string,
		data: any,
		{ inject = [] }: IPresetFileOpts = { inject: [] }
	) => {
		let current = ''
		try {
			current = await (await fs.readFile(filePath)).text()
		} catch {}

		data = transformString(data, inject, models)
		createdFiles.push(filePath)

		if (typeof data === 'string') {
			await fs.writeFile(filePath, `${current}\n${data}`)
		} else {
			await fs.writeJSON(
				filePath,
				deepmerge(json5.parse(current), json5.parse(data))
			)
		}
	}
	const loadPresetFile = (filePath: string) =>
		globalFs.readFile(`${presetPath}/${filePath}`)

	await module.exports({
		models,
		createFile,
		expandFile,
		loadPresetFile,
		createJSONFile,
	})

	return createdFiles
}

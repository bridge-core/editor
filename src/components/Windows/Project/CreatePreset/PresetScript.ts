import json5 from 'json5'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { IPermissions, IPresetFileOpts } from './PresetWindow'
import { transformString } from './TransformString'
import { App } from '/@/App'
import { run } from '/@/components/Extensions/Scripts/run'
import { deepMerge } from '/@/utils/deepmerge'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { CombinedFileSystem } from '/@/components/FileSystem/CombinedFs'

export async function runPresetScript(
	presetPath: string,
	presetScript: string,
	models: Record<string, unknown>,
	permissions: IPermissions
) {
	const app = await App.getApp()
	const fs = app.project?.fileSystem!
	const globalFs = new CombinedFileSystem(
		app.fileSystem.baseDirectory,
		app.dataLoader
	)

	let loadFilePath: string
	if (presetScript.startsWith('./')) {
		loadFilePath = presetScript = presetScript.replaceAll(
			'./',
			presetPath + '/'
		)
	} else {
		loadFilePath = `data/packages/minecraftBedrock/${presetScript}`
	}

	await app.dataLoader.fired
	const script = await globalFs.readFile(loadFilePath)
	const scriptSrc = await script.text()

	const module: any = { exports: undefined }
	try {
		run({
			script: scriptSrc,
			env: {
				module,
			},
		})
	} catch (err) {
		throw new Error(
			`Failed to execute PresetScript "${presetScript}": ${err}`
		)
	}

	if (typeof module.exports !== 'function')
		throw new Error(
			`Failed to execute PresetScript "${presetScript}": module.exports is of type ${typeof module.exports}`
		)

	const createdFiles: AnyFileHandle[] = []
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

		const fileHandle = await fs.getFileHandle(filePath, true)
		createdFiles.push(fileHandle)
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
		const fileHandle = await app.project.fileSystem.getFileHandle(
			filePath,
			true
		)

		// Permission for overwriting unsaved changes not set yet, request it
		if (permissions.mayOverwriteUnsavedChanges === undefined) {
			const tab = await app.project.getFileTab(fileHandle)
			if (tab !== undefined && tab.isUnsaved) {
				const confirmWindow = new ConfirmationWindow({
					description: 'windows.createPreset.overwriteUnsavedChanges',
					confirmText:
						'windows.createPreset.overwriteUnsavedChangesConfirm',
				})

				const overwriteUnsaved = await confirmWindow.fired
				if (overwriteUnsaved) {
					// Stop file collision checks & continue creating preset
					permissions.mayOverwriteUnsavedChanges = true

					tab.close()
				} else {
					// Don't expand file
					permissions.mayOverwriteUnsavedChanges = false
					return
				}
			}
		} else if (permissions.mayOverwriteUnsavedChanges === false) {
			// Permission set to false, abort expanding file
			return
		}

		let current = ''
		try {
			current = await (await fs.readFile(filePath)).text()
		} catch {}

		createdFiles.push(fileHandle)

		if (typeof data === 'string') {
			data = transformString(data, inject, models)
			await fs.writeFile(filePath, `${current}\n${data}`)
		} else {
			data = transformString(json5.stringify(data), inject, models)
			await fs.writeJSON(
				filePath,
				deepMerge(json5.parse(current), json5.parse(data)),
				true
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

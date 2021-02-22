import json5 from 'json5'
import { IPresetFileOpts } from './PresetWindow'
import { transformString } from './TransformString'
import { App } from '/@/App'
import { run } from '/@/components/Extensions/Scripts/run'
import { deepmerge } from '/@/utils/deepmerge'

export async function runPresetScript(
	presetPath: string,
	presetScript: string,
	models: Record<string, unknown>
): Promise<string[]> {
	const app = await App.getApp()
	const fs = app.project?.fileSystem!
	const globalFs = app.fileSystem
	const script = await fs.readFile(`${presetPath}/${presetScript}`)
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
	const createFile = (
		filePath: string,
		data: any,
		{ inject = [] }: IPresetFileOpts = { inject: [] }
	) => {
		if (typeof data !== 'string') data = JSON.stringify(data, null, '\t')

		createdFiles.push(filePath)
		return fs.writeFile(filePath, transformString(data, inject, models))
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

	await module.exports({ models, createFile, expandFile, loadPresetFile })

	return createdFiles
}

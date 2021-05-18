import json5 from 'json5'
import { IPresetFieldOpts } from '/@/components/Windows/Project/CreatePreset/PresetWindow'
import { iterateDir } from '/@/utils/iterateDir'

export interface ISettingDef {
	name: string
	fields: [string, string, IPresetFieldOpts][]
}

export class ExtensionSetting {
	static async load(baseDirectory: FileSystemDirectoryHandle) {
		iterateDir(baseDirectory, async (fileHandle) => {
			const fileContent = await fileHandle
				.getFile()
				.then((file) => file.text())

			let settingsDefinition: ISettingDef = json5.parse(fileContent)
		})
	}
}

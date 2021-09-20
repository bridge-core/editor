import json5 from 'json5'
import { FileType } from '../../Data/FileType'
import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { IDisposable } from '/@/types/disposable'
import { iterateDir } from '/@/utils/iterateDir'

export function loadFileDefinitions(
	baseDirectory: AnyDirectoryHandle,
	disposables: IDisposable[]
) {
	return iterateDir(baseDirectory, async (fileHandle) => {
		const file = await fileHandle.getFile()
		const fileDefinition = json5.parse(await file.text())

		disposables.push(FileType.addPluginFileType(fileDefinition))
	})
}

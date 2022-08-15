import { IframeApi } from '../../IframeApi'

export const openedFileReferenceName = '~bridge://OPENED-FILE'

export async function resolveFileReference(
	fileReference: string,
	api: IframeApi
) {
	if (fileReference === openedFileReferenceName) {
		const fileHandle = api.openedFileHandle

		if (!fileHandle) throw new Error(`No opened file to write to!`)

		return fileHandle
	}

	return await api.app.fileSystem.getFileHandle(fileReference)
}

import { IframeApi } from '../../IframeApi'

export const openedFileReferenceName = '~bridge://OPENED-FILE'

export async function resolveFileReference(
	fileReference: string,
	api: IframeApi,
	createFile = false
) {
	if (fileReference === openedFileReferenceName) {
		const fileHandle = api.openedFileHandle

		if (!fileHandle)
			throw new Error(
				`Failed to de-reference file reference to opened file!`
			)

		return fileHandle
	}

	return await api.app.fileSystem.getFileHandle(fileReference, createFile)
}

export function resolveFileReferencePath(
	fileReference: string,
	api: IframeApi
) {
	if (fileReference === openedFileReferenceName) {
		const filePath = api.openedFilePath

		if (!filePath)
			throw new Error(
				`Failed to de-reference file reference to opened file!`
			)

		return filePath
	}

	return fileReference
}

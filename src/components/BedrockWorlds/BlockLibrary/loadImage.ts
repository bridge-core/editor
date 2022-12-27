import { findFileExtension } from '/@/components/FileSystem/FindFile'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

export async function loadImage(fileSystem: FileSystem, filePath: string) {
	// TODO: Support .tga files
	const realPath = await findFileExtension(fileSystem, filePath, [
		'.png',
		'.jpg',
		'.jpeg',
	])

	if (!realPath) return null

	const file = await fileSystem.readFile(realPath)

	return await createImageBitmap(
		file.isVirtual ? await file.toBlobFile() : file
	)
}

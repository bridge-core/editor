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

	return await createImageBitmap(await fileSystem.readFile(realPath))
}

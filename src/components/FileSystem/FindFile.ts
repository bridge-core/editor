import { FileSystem } from './FileSystem'

export async function findFileExtension(
	fileSystem: FileSystem,
	basePath: string,
	possibleExtensions: string[]
) {
	for (const extension of possibleExtensions) {
		const currPath = `${basePath}${extension}`
		if (await fileSystem.fileExists(currPath)) return currPath
	}
}

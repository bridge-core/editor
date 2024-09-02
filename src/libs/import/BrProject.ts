import { fileSystem } from '../fileSystem/FileSystem'

export async function importFromBrProject(buffer: ArrayBuffer) {
	if (await fileSystem.exists('/import')) await fileSystem.removeDirectory('/import')
}

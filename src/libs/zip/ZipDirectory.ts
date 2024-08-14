import { zip, Zippable } from 'fflate'
import { iterateDirectoryParrallel } from '@/libs/fileSystem/FileSystem'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'

export async function zipDirectory(fileSystem: BaseFileSystem, path: string, ignoreFolders?: Set<string>) {
	// if (import.meta.env.VITE_IS_TAURI_APP) {
	//     const files: { [key: string]: number[] } = {}

	//     await iterateDirParallel(
	//         this.handle,
	//         async (fileHandle, filePath) => {
	//             const file = await fileHandle.getFile()
	//             files[filePath] = Array.from(
	//                 new Uint8Array(await file.arrayBuffer())
	//             )
	//         },
	//         ignoreFolders
	//     )

	//     return new Uint8Array(await invoke('zip_command', { files }))
	// }

	let directoryContents: Zippable = {}
	await iterateDirectoryParrallel(
		fileSystem,
		path,
		async (entry) => {
			// remove the trailing slash
			directoryContents[entry.path.slice(path.length + 1)] = new Uint8Array(await fileSystem.readFile(entry.path))
		},
		ignoreFolders
	)

	return new Promise<Uint8Array>((resolve, reject) =>
		zip(directoryContents, { level: 6 }, (error, data) => {
			if (error) {
				reject(error)
				return
			}

			resolve(data)
		})
	)
}

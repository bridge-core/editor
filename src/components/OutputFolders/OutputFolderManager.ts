import { get } from 'idb-keyval'

export class OutputFolderManager {
	async loadAll() {
		const outputFolders = await get('outputFolders')

		for (const { directoryHandle, dataBag } of outputFolders) {
		}
	}
}

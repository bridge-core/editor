import { expose } from 'comlink'
import { TaskService } from '/@/components/TaskManager/WorkerTask'

export class VanillaDownloaderService extends TaskService<void> {
	constructor(baseDirectory: FileSystemDirectoryHandle) {
		super('vanillaDownloader', baseDirectory)
	}

	async onStart() {
		// TODO: Download vanilla packs and save them to /data/vanilla/ folder
	}
}

expose(VanillaDownloaderService, self)

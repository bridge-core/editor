import { trigger } from '@/appCycle/EventSystem'
import { IFileSystem, IMkdirConfig } from './Common'
import { FileSystem } from './Main'

export class RemoteFileSystem implements IFileSystem {
	constructor() {}

	static create() {
		FileSystem.set(new RemoteFileSystem())
	}
	static get() {
		return FileSystem.get()
	}

	async mkdir(path: string[], options: Partial<IMkdirConfig> = {}) {
		await trigger('bridge:remoteAction', {
			action: 'fs.mkdir',
			args: [path, options],
		})
	}

	readdir(
		path: string[],
		{ withFileTypes }: { withFileTypes: true }
	): Promise<FileSystemHandle[]>
	readdir(
		path: string[],
		{ withFileTypes }: { withFileTypes?: false }
	): Promise<string[]>
	async readdir(
		path: string[],
		options: { withFileTypes?: true | false } = {}
	) {
		return (
			await trigger('bridge:remoteAction', {
				action: 'fs.readdir',
				args: [path, options],
			})
		)?.[0] as FileSystemHandle[] | string[]
	}

	readFile(path: string[]) {
		return trigger('bridge:remoteAction', {
			action: 'fs.readFile',
			args: [path],
		}).then(data => data?.[0] as File)
	}

	async unlink(path: string[]) {
		await trigger('bridge:remoteAction', {
			action: 'fs.unlink',
			args: [path],
		})
	}

	async writeFile(path: string[], data: FileSystemWriteChunkType) {
		await trigger('bridge:remoteAction', {
			action: 'fs.unlink',
			args: [path, data],
		})
	}
}

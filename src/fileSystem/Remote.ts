import { on, trigger } from '@/appCycle/EventSystem'
import { IFileSystem, IMkdirConfig } from './Common'
import { FileSystem } from './Main'
import { v4 as uuid } from 'uuid'

export class RemoteFileSystem implements IFileSystem {
	constructor() {
		FileSystem.fsReadyPromiseResolves.forEach(resolve => resolve(this))
	}

	static create() {
		const fs = new RemoteFileSystem()
		console.log(fs)
		FileSystem.set(fs)
	}
	static get() {
		return FileSystem.get()
	}

	dispatchRemoteAction(action: string, args: unknown[]) {
		return new Promise(resolve => {
			const id = uuid()
			const listener = on(`bridge:remoteResponse(${id})`, (data: any) => {
				resolve(data.response)
				listener.dispose()
			})

			trigger('bridge:remoteAction', {
				action: `fs.${action}`,
				args: args,
				id,
			})
		})
	}

	async mkdir(path: string[], options: Partial<IMkdirConfig> = {}) {
		return this.dispatchRemoteAction('mkdir', [path, options]) as Promise<
			void
		>
	}

	readdir(
		path: string[],
		{ withFileTypes }: { withFileTypes: true }
	): Promise<FileSystemHandle[]>
	readdir(
		path: string[],
		{ withFileTypes }: { withFileTypes?: false }
	): Promise<string[]>
	readdir(path: string[], options: { withFileTypes?: true | false } = {}) {
		return this.dispatchRemoteAction('readdir', [path, options])
	}

	readFile(path: string[]) {
		return this.dispatchRemoteAction('readFile', [path]) as Promise<File>
	}

	unlink(path: string[]) {
		return this.dispatchRemoteAction('unlink', [path]) as Promise<void>
	}

	writeFile(path: string[], data: FileSystemWriteChunkType) {
		return this.dispatchRemoteAction('writeFile', [path, data]) as Promise<
			void
		>
	}
}

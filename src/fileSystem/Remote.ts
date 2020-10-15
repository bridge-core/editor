import { on, trigger } from '@/appCycle/EventSystem'
import { IFileSystem, IMkdirConfig } from './Common'
import { FileSystem } from './Main'
import { v4 as uuid } from 'uuid'
import { dispatchRemoteAction } from '@/appCycle/remote/Client'

export class RemoteFileSystem implements IFileSystem {
	constructor() {
		FileSystem.fsReadyPromiseResolves.forEach(resolve => resolve(this))
	}

	static create() {
		FileSystem.set(new RemoteFileSystem())
	}
	static get() {
		return FileSystem.get()
	}

	dispatchRemoteAction(action: string, ...args: unknown[]) {
		return dispatchRemoteAction('fileSystem', action, ...args)
	}

	async mkdir(path: string[], options: Partial<IMkdirConfig> = {}) {
		return this.dispatchRemoteAction('mkdir', path, options) as Promise<
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
		return this.dispatchRemoteAction('readdir', path, options)
	}

	async readFile(path: string[]) {
		const file = await this.dispatchRemoteAction('readFile', path)

		if (file instanceof File) return file
		else if (file instanceof ArrayBuffer) {
			const decoder = new TextDecoder()
			return new File([decoder.decode(file)], path[path.length - 1])
		}

		console.log(file)
		throw new Error(`Unknown remote readFile type!`)
	}

	unlink(path: string[]) {
		return this.dispatchRemoteAction('unlink', path) as Promise<void>
	}

	writeFile(path: string[], data: FileSystemWriteChunkType) {
		return this.dispatchRemoteAction('writeFile', path, data) as Promise<
			void
		>
	}
}

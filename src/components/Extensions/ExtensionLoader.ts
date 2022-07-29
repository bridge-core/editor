import { Signal } from '/@/components/Common/Event/Signal'
import { unzip, Unzipped } from 'fflate'
import { FileSystem } from '../FileSystem/FileSystem'
import { createErrorNotification } from '../Notifications/Errors'
import { Extension } from './Extension'
import { ActiveStatus } from './ActiveStatus'
import {
	AnyDirectoryHandle,
	AnyFileHandle,
	AnyHandle,
} from '../FileSystem/Types'
import { TPackTypeId } from '../Data/PackType'

export interface IExtensionManifest {
	icon?: string
	author: string
	name: string
	releaseTimestamp: number
	version: string
	id: string
	description: string
	link: string
	readme: string
	tags: string[]
	dependencies: string[]
	compiler: {
		plugins: Record<string, string>
	}
	contributeFiles: Record<string, { pack: TPackTypeId; path: string }>
	compatibleAppVersions?: {
		min?: string
		max?: string
	}
}

export class ExtensionLoader extends Signal<void> {
	protected _extensions = new Map<string, Extension>()
	protected extensionPaths = new Map<string, string>()
	protected _loadedInstalledExtensions = new Signal<void>(2)
	public activeStatus: ActiveStatus | undefined

	get extensions() {
		return this._extensions
	}

	constructor(
		protected fileSystem: FileSystem,
		protected loadExtensionsFrom: string,
		protected saveInactivePath: string,
		protected isGlobal = false
	) {
		super()
	}

	async loadActiveExtensions() {
		this.activeStatus = new ActiveStatus(
			this.fileSystem,
			this.saveInactivePath
		)
		await this.activeStatus.fired
	}

	async getInstalledExtensions() {
		await this.fired
		return new Set(this.extensions.values())
	}

	async loadExtensions(path: string = this.loadExtensionsFrom) {
		const baseDirectory = await this.fileSystem.getDirectoryHandle(path, {
			create: true,
		})

		await this.loadActiveExtensions()
		const promises: Promise<unknown>[] = []

		for await (const entry of baseDirectory.values()) {
			if (entry.name === '.DS_Store') continue

			promises.push(this.loadExtension(baseDirectory, entry, false))
		}

		await Promise.all(promises)
		this._loadedInstalledExtensions.dispatch()

		for (const [_, extension] of this._extensions) {
			if (extension.isActive) await extension.activate()
		}

		this.dispatch()
	}

	async loadExtension(
		baseDirectory: AnyDirectoryHandle,
		handle: AnyHandle,
		activate = false
	) {
		let extension: Extension | undefined
		if (handle.kind === 'file' && handle.name.endsWith('.zip')) {
			extension = await this.unzipExtension(
				handle,
				await baseDirectory.getDirectoryHandle(
					handle.name.replace('.zip', ''),
					{ create: true }
				)
			)
			await baseDirectory.removeEntry(handle.name)
		} else if (handle.kind === 'directory') {
			extension = await this.loadManifest(handle)
		}

		if (activate && extension) await extension.activate()
		return extension
	}

	protected async unzipExtension(
		fileHandle: AnyFileHandle,
		baseDirectory: AnyDirectoryHandle
	) {
		const fs = new FileSystem(baseDirectory)
		const file = await fileHandle.getFile()
		const zip = await new Promise<Unzipped>(async (resolve, reject) =>
			unzip(new Uint8Array(await file.arrayBuffer()), (err, data) => {
				if (err) reject(err)
				else resolve(data)
			})
		)

		for (const fileName in zip) {
			if (fileName.startsWith('.')) continue

			if (fileName.endsWith('/')) {
				await fs.mkdir(fileName.slice(0, -1), {
					recursive: true,
				})

				continue
			}

			await fs.writeFile(fileName, zip[fileName])
		}

		return await this.loadManifest(baseDirectory)
	}

	protected async loadManifest(baseDirectory: AnyDirectoryHandle) {
		let manifestHandle: AnyFileHandle
		try {
			manifestHandle = await baseDirectory.getFileHandle('manifest.json')
		} catch {
			return
		}

		const manifestFile = await manifestHandle.getFile()
		const manifest: Partial<IExtensionManifest> = await manifestFile
			.text()
			.then((str) => JSON.parse(str))

		if (manifest.id) {
			const extension = new Extension(
				this,
				<IExtensionManifest>manifest,
				baseDirectory,
				this.isGlobal
			)

			this._extensions.set(manifest.id, extension)
			this.extensionPaths.set(
				manifest.id,
				`${this.loadExtensionsFrom}/${baseDirectory.name}`
			)
			return extension
		} else {
			createErrorNotification(
				new Error(
					`Failed to load extension "${
						manifest.name ?? baseDirectory.name
					}": Invalid extension ID`
				)
			)
		}
	}

	async activate(id: string) {
		const extension = this.extensions.get(id)

		if (extension) {
			if (extension.isActive) await extension.activate()

			return true
		} else {
			createErrorNotification(
				new Error(
					`Failed to activate extension with ID "${id}": Extension not found`
				)
			)
			return false
		}
	}

	deactivate(id: string) {
		const extension = this.extensions.get(id)

		if (extension) {
			extension.deactivate()
			return true
		} else {
			createErrorNotification(
				new Error(
					`Failed to deactivate extension with ID "${id}": Extension not found`
				)
			)
			return false
		}
	}
	has(id: string) {
		return this.extensions.has(id)
	}
	deactiveAll(dispose = false) {
		for (const [key, ext] of this._extensions) {
			ext.deactivate()
			if (dispose) this._extensions.delete(key)
		}
	}
	disposeAll() {
		this.deactiveAll(true)
		this.resetSignal()
	}
	deleteExtension(id: string) {
		const extensionPath = this.extensionPaths.get(id)

		if (extensionPath) {
			this.fileSystem.unlink(extensionPath)
			this.extensionPaths.delete(id)
			this.extensions.delete(id)
		}
	}

	mapActive<T>(cb: (ext: Extension) => T) {
		const res: T[] = []

		for (const ext of this._extensions.values()) {
			if (ext.isActive) res.push(cb(ext))
		}

		return res
	}
}

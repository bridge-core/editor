import { App } from '@/App'
import { Signal } from '@/components/Common/Event/Signal'
import JSZip from 'jszip'
import { dirname } from 'path'
import { FileSystem } from '../FileSystem/Main'
import { createErrorNotification } from '../Notifications/Errors'
import { Extension } from './Extension'

export interface IExtensionManifest {
	icon?: string
	author: string
	name: string
	releaseTimestamp: number
	version: string
	id: string
	description: string
	link: string
	tags: string[]
	dependencies: string[]
	compiler: {
		plugins: Record<string, string>
	}
}

export class ExtensionLoader extends Signal<void> {
	protected globalExtensions = new Map<string, Extension>()
	protected localExtensions = new Map<string, Extension>()
	protected _loadedInstalledExtensions = new Signal<void>(2)
	get extensions() {
		return new Map([
			...this.globalExtensions.entries(),
			...this.localExtensions.entries(),
		])
	}

	get loadedInstalledExtensions() {
		return new Promise<void>(resolve =>
			this._loadedInstalledExtensions.once(resolve)
		)
	}

	constructor() {
		super(2)
	}

	async getInstalledExtensions() {
		await this.loadedInstalledExtensions
		return new Map(this.extensions.entries())
	}

	async loadExtensions(
		baseDirectory: FileSystemDirectoryHandle,
		isGlobal = false
	) {
		const promises: Promise<unknown>[] = []

		for await (const entry of baseDirectory.values()) {
			if (entry.name === '.DS_Store') continue

			promises.push(
				this.loadExtension(baseDirectory, entry, false, isGlobal)
			)
		}

		await Promise.all(promises)
		this._loadedInstalledExtensions.dispatch()

		for (const [_, extension] of isGlobal
			? this.globalExtensions
			: this.localExtensions) {
			if (!extension.isActive) await extension.activate()
		}

		this.dispatch()
	}

	async loadExtension(
		baseDirectory: FileSystemDirectoryHandle,
		handle: FileSystemHandle,
		activate = false,
		isGlobal = false
	) {
		let extension: Extension | undefined
		if (handle.kind === 'file' && handle.name.endsWith('.zip')) {
			extension = await this.unzipExtension(
				handle,
				await baseDirectory.getDirectoryHandle(
					handle.name.replace('.zip', ''),
					{ create: true }
				),
				isGlobal
			)
			await baseDirectory.removeEntry(handle.name)
		} else if (handle.kind === 'directory') {
			extension = await this.loadManifest(handle, isGlobal)
		}

		if (activate && extension) await extension.activate()
		return extension
	}

	protected async unzipExtension(
		fileHandle: FileSystemFileHandle,
		baseDirectory: FileSystemDirectoryHandle,
		isGlobal: boolean
	) {
		const fs = new FileSystem(baseDirectory)
		const file = await fileHandle.getFile()
		const zip = await JSZip.loadAsync(await file.arrayBuffer())

		const promises: Promise<unknown>[] = []
		zip.forEach((relativePath, zipEntry) => {
			promises.push(
				new Promise<void>(async resolve => {
					if (zipEntry.dir) return resolve()

					if (dirname(relativePath) !== '.')
						await fs.mkdir(dirname(relativePath), {
							recursive: true,
						})

					await fs
						.writeFile(relativePath, await zipEntry.async('blob'))
						.catch(() => console.log(relativePath))

					resolve()
				})
			)
		})
		await Promise.all(promises)

		return await this.loadManifest(baseDirectory, isGlobal)
	}

	protected async loadManifest(
		baseDirectory: FileSystemDirectoryHandle,
		isGlobal: boolean
	) {
		let manifestHandle: FileSystemFileHandle
		try {
			manifestHandle = await baseDirectory.getFileHandle('manifest.json')
		} catch {
			return
		}

		const manifestFile = await manifestHandle.getFile()
		const manifest: Partial<IExtensionManifest> = await manifestFile
			.text()
			.then(str => JSON.parse(str))

		if (manifest.id) {
			const extension = new Extension(
				this,
				<IExtensionManifest>manifest,
				baseDirectory,
				isGlobal
			)
			;(isGlobal ? this.globalExtensions : this.localExtensions).set(
				manifest.id,
				extension
			)
			return extension
		} else {
			createErrorNotification(
				new Error(
					`Failed to load extension "${manifest.name ??
						baseDirectory.name}": Invalid extension ID`
				)
			)
		}
	}

	async activate(id: string) {
		const extension = await this.extensions.get(id)

		if (extension) {
			if (!extension.isActive) await extension.activate()
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

	deactivateAll() {
		for (const [key, ext] of this.localExtensions) {
			ext.deactivate()
			this.localExtensions.delete(key)
		}
	}
}

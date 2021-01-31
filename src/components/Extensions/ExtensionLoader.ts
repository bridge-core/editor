import { App } from '@/App'
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
}

export class ExtensionLoader {
	protected extensions = new Map<string, Extension>()

	constructor() {}

	async loadExtensions(baseDirectory: FileSystemDirectoryHandle) {
		const promises: Promise<unknown>[] = []

		for await (const entry of baseDirectory.values()) {
			if (entry.kind === 'file' && entry.name.endsWith('.zip'))
				promises.push(
					this.unzipExtensions(
						entry,
						await baseDirectory.getDirectoryHandle(
							entry.name.replace('.zip', ''),
							{ create: true }
						)
					).then(() => baseDirectory.removeEntry(entry.name))
				)
			else if (entry.kind === 'directory')
				promises.push(this.loadManifest(entry))
		}

		await Promise.all(promises)

		for (const [_, extension] of this.extensions) {
			if (!extension.isActive) await extension.activate()
		}
	}
	protected async unzipExtensions(
		fileHandle: FileSystemFileHandle,
		baseDirectory: FileSystemDirectoryHandle
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

		await this.loadManifest(baseDirectory)
	}

	protected async loadManifest(baseDirectory: FileSystemDirectoryHandle) {
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
			this.extensions.set(
				manifest.id,
				new Extension(this, <IExtensionManifest>manifest, baseDirectory)
			)
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
			await extension.activate()
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
		for (const [key, ext] of this.extensions) {
			ext.deactivate()
			this.extensions.delete(key)
		}
	}
}

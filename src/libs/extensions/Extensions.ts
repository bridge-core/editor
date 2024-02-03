import { fileSystem } from '@/App'
import { join } from '@/libs/path'
import { Unzipped, unzip } from 'fflate'
import { Extension } from './Extension'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'

export interface ExtensionManifest {
	author: string
	description: string
	icon: string
	id: string
	link: string
	name: string
	tags: string[]
	target: string
	version: string
	releaseTimestamp: number
}

export class Extensions {
	private extensions: Extension[] = []

	constructor() {
		fileSystem.eventSystem.on('reloaded', this.fileSystemReloaded.bind(this))
	}

	public async load() {
		if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) return

		for (const entry of await fileSystem.readDirectoryEntries('/extensions')) {
			await this.loadExtension(entry.path)
		}
	}

	public async install(extension: ExtensionManifest) {
		const arrayBuffer = await (
			await fetch('https://raw.githubusercontent.com/bridge-core/plugins/master' + extension.link)
		).arrayBuffer()

		const unzipped = await new Promise<Unzipped>(async (resolve, reject) =>
			unzip(new Uint8Array(arrayBuffer), (err, data) => {
				if (err) reject(err)
				else resolve(data)
			})
		)

		const path = join('/extensions', extension.name.replace(/\s+/g, ''))

		for (const filePath in unzipped) {
			if (filePath.startsWith('.')) continue

			await fileSystem.ensureDirectory(join(path, filePath))

			if (filePath.endsWith('/')) {
				await fileSystem.makeDirectory(join(path, filePath))

				continue
			}

			await fileSystem.writeFile(join(path, filePath), unzipped[filePath])
		}

		await this.loadExtension(path)
	}

	private async fileSystemReloaded() {
		await this.load()
	}

	private async loadExtension(path: string) {
		const extension = new Extension(path)
		await extension.load()

		this.extensions.push(extension)
	}
}

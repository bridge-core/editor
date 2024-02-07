import { fileSystem } from '@/App'
import { join } from '@/libs/path'
import { Unzipped, unzip } from 'fflate'
import { Extension } from './Extension'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { ProjectManager } from '@/libs/project/ProjectManager'

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
	private globalExtensions: Extension[] = []
	private projectExtensions: Extension[] = []

	constructor() {
		fileSystem.eventSystem.on('reloaded', this.fileSystemReloaded.bind(this))
	}

	public async load() {
		if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) return

		for (const entry of await fileSystem.readDirectoryEntries('extensions')) {
			await this.loadExtension(entry.path)
		}
	}

	public async loadProjectExtensions() {
		if (ProjectManager.currentProject === null) return

		for (const entry of await fileSystem.readDirectoryEntries(
			join(ProjectManager.currentProject.path, '.bridge/extensions')
		)) {
			await this.loadProjectExtension(entry.path)
		}
	}

	public disposeProjectExtensions() {
		this.projectExtensions = []
	}

	public async installGlobal(extension: ExtensionManifest) {
		const unzippedExtension = await this.downloadExtension(extension)

		const path = join('extensions', extension.name.replace(/\s+/g, ''))

		for (const filePath in unzippedExtension) {
			if (filePath.startsWith('.')) continue

			await fileSystem.ensureDirectory(join(path, filePath))

			if (filePath.endsWith('/')) {
				await fileSystem.makeDirectory(join(path, filePath))

				continue
			}

			await fileSystem.writeFile(join(path, filePath), unzippedExtension[filePath])
		}

		await this.loadExtension(path)
	}

	public async installProject(extension: ExtensionManifest) {
		if (ProjectManager.currentProject === null) return

		const unzippedExtension = await this.downloadExtension(extension)

		const path = join(ProjectManager.currentProject.path, '.bridge/extensions', extension.name.replace(/\s+/g, ''))

		for (const filePath in unzippedExtension) {
			if (filePath.startsWith('.')) continue

			await fileSystem.ensureDirectory(join(path, filePath))

			if (filePath.endsWith('/')) {
				await fileSystem.makeDirectory(join(path, filePath))

				continue
			}

			await fileSystem.writeFile(join(path, filePath), unzippedExtension[filePath])
		}

		await this.loadExtension(path)
	}

	public isInstalledGlobal(id: string): boolean {
		return this.globalExtensions.find((extension) => id === extension.id) !== undefined
	}

	public isInstalledProject(id: string): boolean {
		return this.projectExtensions.find((extension) => id === extension.id) !== undefined
	}

	public isInstalled(id: string): boolean {
		return this.isInstalledGlobal(id) || this.isInstalledProject(id)
	}

	private async downloadExtension(extension: ExtensionManifest): Promise<Unzipped> {
		const arrayBuffer = await (
			await fetch('https://raw.githubusercontent.com/bridge-core/plugins/master' + extension.link)
		).arrayBuffer()

		return await new Promise<Unzipped>(async (resolve, reject) =>
			unzip(new Uint8Array(arrayBuffer), (err, data) => {
				if (err) reject(err)
				else resolve(data)
			})
		)
	}

	private async fileSystemReloaded() {
		await this.load()
	}

	private async loadExtension(path: string) {
		const extension = new Extension(path)
		await extension.load()

		this.globalExtensions.push(extension)
	}

	private async loadProjectExtension(path: string) {
		const extension = new Extension(path)
		await extension.load()

		this.projectExtensions.push(extension)
	}
}

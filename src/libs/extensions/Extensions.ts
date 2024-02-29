import { fileSystem } from '@/App'
import { join } from '@/libs/path'
import { Unzipped, unzip } from 'fflate'
import { Extension } from './Extension'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { EventSystem } from '@/libs/event/EventSystem'
import { Ref, onMounted, onUnmounted, ref } from 'vue'

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
	contributeFiles: Record<string, { path: string; pack: string }>
}

export class Extensions {
	private globalExtensions: Extension[] = []
	private projectExtensions: Extension[] = []
	private eventSystem = new EventSystem(['extensionsUpdated'])

	constructor() {
		fileSystem.eventSystem.on('reloaded', this.fileSystemReloaded.bind(this))
	}

	public async load() {
		if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) return

		for (const entry of await fileSystem.readDirectoryEntries('extensions')) {
			await this.loadExtension(entry.path)
		}

		this.eventSystem.dispatch('extensionsUpdated', undefined)
	}

	public async loadProjectExtensions() {
		if (ProjectManager.currentProject === null) return

		for (const entry of await fileSystem.readDirectoryEntries(
			join(ProjectManager.currentProject.path, '.bridge/extensions')
		)) {
			await this.loadProjectExtension(entry.path)
		}

		this.eventSystem.dispatch('extensionsUpdated', undefined)
	}

	public disposeProjectExtensions() {
		this.projectExtensions = []
	}

	public async installGlobal(extension: ExtensionManifest) {
		const path = join('extensions', extension.name.replace(/\s+/g, ''))

		await this.installExtension(extension, path)
	}

	public async installProject(extension: ExtensionManifest) {
		if (ProjectManager.currentProject === null) return

		const path = join(ProjectManager.currentProject.path, '.bridge/extensions', extension.name.replace(/\s+/g, ''))

		await this.installExtension(extension, path)
	}

	public async uninstall(id: string) {
		const projectExtension = this.projectExtensions.find((extension) => extension.id == id)

		const extension = projectExtension ?? this.globalExtensions.find((extension) => extension.id == id)

		if (extension === undefined) return

		await extension.unload()

		await fileSystem.removeDirectory(extension.path)

		if (projectExtension !== undefined) {
			this.projectExtensions = this.projectExtensions.filter(
				(otherExtension) => otherExtension.id !== extension.id
			)
		} else {
			this.globalExtensions = this.globalExtensions.filter((otherExtension) => otherExtension.id !== extension.id)
		}

		this.eventSystem.dispatch('extensionsUpdated', undefined)
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

	public useIsInstalledGlobal(): Ref<(id: string) => boolean> {
		const isInstalledGlobal = ref((id: string) => this.isInstalledGlobal(id))

		const update = () => {
			isInstalledGlobal.value = (id: string) => this.isInstalledGlobal(id)
		}

		onMounted(() => {
			this.eventSystem.on('extensionsUpdated', update)
		})

		onUnmounted(() => {
			this.eventSystem.off('extensionsUpdated', update)
		})

		return isInstalledGlobal
	}

	public useIsInstalledProject(): Ref<(id: string) => boolean> {
		const isInstalledProject = ref((id: string) => this.isInstalledProject(id))

		const update = () => {
			isInstalledProject.value = (id: string) => this.isInstalledProject(id)
		}

		onMounted(() => {
			this.eventSystem.on('extensionsUpdated', update)
		})

		onUnmounted(() => {
			this.eventSystem.off('extensionsUpdated', update)
		})

		return isInstalledProject
	}

	public useIsInstalled(): Ref<(id: string) => boolean> {
		const isInstalled = ref((id: string) => this.isInstalled(id))

		const update = () => {
			isInstalled.value = (id: string) => this.isInstalled(id)
		}

		onMounted(() => {
			this.eventSystem.on('extensionsUpdated', update)
		})

		onUnmounted(() => {
			this.eventSystem.off('extensionsUpdated', update)
		})

		return isInstalled
	}

	private async installExtension(extension: ExtensionManifest, path: string) {
		const unzippedExtension = await this.downloadExtension(extension)

		for (const filePath in unzippedExtension) {
			if (filePath.startsWith('.')) continue

			await fileSystem.ensureDirectory(join(path, filePath))

			if (filePath.endsWith('/')) {
				await fileSystem.makeDirectory(join(path, filePath))

				continue
			}

			await fileSystem.writeFile(join(path, filePath), unzippedExtension[filePath])
		}

		if (ProjectManager.currentProject !== null) {
			const contributeFiles = extension.contributeFiles

			if (contributeFiles !== undefined) {
				for (const [extensionPath, { pack, path: projectPath }] of Object.entries(contributeFiles)) {
					const resultPath = ProjectManager.currentProject.resolvePackPath(pack, projectPath)

					await fileSystem.ensureDirectory(resultPath)
					await fileSystem.copyDirectory(join(path, extensionPath), resultPath)

					console.log(contributeFiles, resultPath)
				}
			}
		}

		await this.loadExtension(path)

		this.eventSystem.dispatch('extensionsUpdated', undefined)
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

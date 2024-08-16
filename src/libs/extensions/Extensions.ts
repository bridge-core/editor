import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { extname, join } from 'pathe'
import { Unzipped, unzip } from 'fflate'
import { Extension, ExtensionManifest } from './Extension'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'
import { Theme } from '@/libs/theme/Theme'
import { Snippet } from '@/libs/snippets/Snippet'
import { TBaseModule } from '@bridge-editor/js-runtime/dist/Runtime'

export class Extensions {
	public static globalExtensions: Record<string, Extension> = {}
	public static projectExtensions: Record<string, Extension> = {}
	public static activeExtensions: Record<string, Extension> = {}

	public static updated: Event<undefined> = new Event()

	public static themes: Theme[] = []
	public static snippets: Snippet[] = []
	public static presets: Record<string, any> = {}

	public static loaded: boolean = false

	private static modules: Record<string, TBaseModule> = {}

	public static setup() {
		if (fileSystem instanceof PWAFileSystem) fileSystem.reloaded.on(this.fileSystemReloaded.bind(this))
	}

	public static async load() {
		if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) return

		await this.loadGlobalExtensions()

		this.loaded = true
	}

	public static async loadGlobalExtensions() {
		if (!(await fileSystem.exists('extensions'))) await fileSystem.makeDirectory('extensions')

		for (const entry of await fileSystem.readDirectoryEntries('extensions')) {
			const extension = await this.loadExtension(entry.path)

			this.globalExtensions[extension.id] = extension
		}

		await this.updateExtensions()
	}

	public static async loadProjectExtensions() {
		if (ProjectManager.currentProject === null) return

		const path = join(ProjectManager.currentProject.path, '.bridge/extensions')

		if (!(await fileSystem.exists(path))) await fileSystem.makeDirectory(path)

		for (const entry of await fileSystem.readDirectoryEntries(path)) {
			const extension = await this.loadExtension(entry.path)

			this.projectExtensions[extension.id] = extension
		}

		await this.updateExtensions()
	}

	public static unloadProjectExtensions() {
		this.projectExtensions = {}
	}

	public static async installGlobal(extension: ExtensionManifest) {
		const path = join('extensions', extension.name.replace(/\s+/g, ''))

		const loadedExtension = await this.installExtension(extension, path)

		this.globalExtensions[loadedExtension.id] = loadedExtension

		await this.updateExtensions()
	}

	public static async installProject(extension: ExtensionManifest) {
		if (ProjectManager.currentProject === null) return

		const path = join(ProjectManager.currentProject.path, '.bridge/extensions', extension.name.replace(/\s+/g, ''))

		const loadedExtension = await this.installExtension(extension, path)

		this.globalExtensions[loadedExtension.id] = loadedExtension

		await this.updateExtensions()
	}

	public static async uninstall(id: string) {
		const projectExtension = this.projectExtensions[id]

		const extension = projectExtension ?? this.globalExtensions[id]

		if (extension === undefined) return

		await fileSystem.removeDirectory(extension.path)

		if (projectExtension !== undefined) {
			delete this.projectExtensions[id]
		} else {
			delete this.globalExtensions[id]
		}

		await this.updateExtensions()
	}

	public static registerModule(name: string, value: any) {
		this.modules[name] = value
	}

	public static getModules(): [string, TBaseModule][] {
		return Object.entries(this.modules)
	}

	private static async updateExtensions() {
		this.activeExtensions = { ...this.globalExtensions, ...this.projectExtensions }

		this.themes = Object.values(this.activeExtensions).flatMap((extension) => extension.themes)
		this.snippets = Object.values(this.activeExtensions).flatMap((extension) => extension.snippets)

		this.presets = {}
		for (const extension of Object.values(this.activeExtensions)) {
			this.presets = { ...this.presets, ...extension.presets }
		}

		this.updated.dispatch()
	}

	private static async installExtension(extension: ExtensionManifest, path: string): Promise<Extension> {
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
				for (const [entryPath, { pack, path: projectPath }] of Object.entries(contributeFiles)) {
					const resultPath = ProjectManager.currentProject.resolvePackPath(pack, projectPath)

					await fileSystem.ensureDirectory(resultPath)

					if (extname(entryPath) === '') {
						await fileSystem.copyDirectory(join(path, entryPath), resultPath)
					} else {
						await fileSystem.copyFile(join(path, entryPath), resultPath)
					}
				}
			}
		}

		return await this.loadExtension(path)
	}

	private static async downloadExtension(extension: ExtensionManifest): Promise<Unzipped> {
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

	private static async fileSystemReloaded() {
		await this.load()
	}

	private static async loadExtension(path: string): Promise<Extension> {
		const extension = new Extension(path)
		await extension.load()

		return extension
	}

	public static isInstalledGlobal(id: string): boolean {
		return this.globalExtensions[id] !== undefined
	}

	public static isInstalledProject(id: string): boolean {
		return this.projectExtensions[id] !== undefined
	}

	public static isInstalled(id: string): boolean {
		return this.isInstalledGlobal(id) || this.isInstalledProject(id)
	}

	public static useIsInstalledGlobal(): Ref<(id: string) => boolean> {
		const isInstalledGlobal = ref((id: string) => this.isInstalledGlobal(id))

		const update = () => {
			isInstalledGlobal.value = (id: string) => this.isInstalledGlobal(id)
		}

		let disposable: Disposable

		onMounted(() => {
			disposable = this.updated.on(update)
		})

		onUnmounted(() => {
			disposable.dispose()
		})

		return isInstalledGlobal
	}

	public static useIsInstalledProject(): Ref<(id: string) => boolean> {
		const isInstalledProject = ref((id: string) => this.isInstalledProject(id))

		const update = () => {
			isInstalledProject.value = (id: string) => this.isInstalledProject(id)
		}

		let disposable: Disposable

		onMounted(() => {
			disposable = this.updated.on(update)
		})

		onUnmounted(() => {
			disposable.dispose()
		})

		return isInstalledProject
	}

	public static useIsInstalled(): Ref<(id: string) => boolean> {
		const isInstalled = ref((id: string) => this.isInstalled(id))

		const update = () => {
			isInstalled.value = (id: string) => this.isInstalled(id)
		}

		let disposable: Disposable

		onMounted(() => {
			disposable = this.updated.on(update)
		})

		onUnmounted(() => {
			disposable.dispose()
		})

		return isInstalled
	}
}

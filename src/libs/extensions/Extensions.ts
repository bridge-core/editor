import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { extname, join } from '@/libs/path'
import { Unzipped, unzip } from 'fflate'
import { Extension, ExtensionManifest } from './Extension'
import { PWAFileSystem } from '@/libs/fileSystem/PWAFileSystem'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import { Event } from '@/libs/event/Event'
import { Disposable } from '@/libs/disposeable/Disposeable'

export class Extensions {
	private static globalExtensions: Extension[] = []
	private static projectExtensions: Extension[] = []
	private static updated: Event<undefined> = new Event()

	public static setup() {
		if (fileSystem instanceof PWAFileSystem) fileSystem.reloaded.on(Extensions.fileSystemReloaded)
	}

	public static async load() {
		if (fileSystem instanceof PWAFileSystem && !fileSystem.setup) return

		for (const entry of await fileSystem.readDirectoryEntries('extensions')) {
			await Extensions.loadExtension(entry.path)
		}

		Extensions.updated.dispatch(undefined)
	}

	public static async loadProjectExtensions() {
		if (ProjectManager.currentProject === null) return

		for (const entry of await fileSystem.readDirectoryEntries(
			join(ProjectManager.currentProject.path, '.bridge/extensions')
		)) {
			await Extensions.loadProjectExtension(entry.path)
		}

		Extensions.updated.dispatch(undefined)
	}

	public static disposeProjectExtensions() {
		Extensions.projectExtensions = []
	}

	public static async installGlobal(extension: ExtensionManifest) {
		const path = join('extensions', extension.name.replace(/\s+/g, ''))

		await Extensions.installExtension(extension, path)
	}

	public static async installProject(extension: ExtensionManifest) {
		if (ProjectManager.currentProject === null) return

		const path = join(ProjectManager.currentProject.path, '.bridge/extensions', extension.name.replace(/\s+/g, ''))

		await Extensions.installExtension(extension, path)
	}

	public static async uninstall(id: string) {
		const projectExtension = Extensions.projectExtensions.find((extension) => extension.id == id)

		const extension = projectExtension ?? Extensions.globalExtensions.find((extension) => extension.id == id)

		if (extension === undefined) return

		await extension.unload()

		await fileSystem.removeDirectory(extension.path)

		if (projectExtension !== undefined) {
			Extensions.projectExtensions = Extensions.projectExtensions.filter(
				(otherExtension) => otherExtension.id !== extension.id
			)
		} else {
			Extensions.globalExtensions = Extensions.globalExtensions.filter(
				(otherExtension) => otherExtension.id !== extension.id
			)
		}

		Extensions.updated.dispatch(undefined)
	}

	public static isInstalledGlobal(id: string): boolean {
		return Extensions.globalExtensions.find((extension) => id === extension.id) !== undefined
	}

	public static isInstalledProject(id: string): boolean {
		return Extensions.projectExtensions.find((extension) => id === extension.id) !== undefined
	}

	public static isInstalled(id: string): boolean {
		return Extensions.isInstalledGlobal(id) || Extensions.isInstalledProject(id)
	}

	public static useIsInstalledGlobal(): Ref<(id: string) => boolean> {
		const isInstalledGlobal = ref((id: string) => Extensions.isInstalledGlobal(id))

		const update = () => {
			isInstalledGlobal.value = (id: string) => Extensions.isInstalledGlobal(id)
		}

		let disposable: Disposable

		onMounted(() => {
			disposable = Extensions.updated.on(update)
		})

		onUnmounted(() => {
			disposable.dispose()
		})

		return isInstalledGlobal
	}

	public static useIsInstalledProject(): Ref<(id: string) => boolean> {
		const isInstalledProject = ref((id: string) => Extensions.isInstalledProject(id))

		const update = () => {
			isInstalledProject.value = (id: string) => Extensions.isInstalledProject(id)
		}

		let disposable: Disposable

		onMounted(() => {
			disposable = Extensions.updated.on(update)
		})

		onUnmounted(() => {
			disposable.dispose()
		})

		return isInstalledProject
	}

	public static useIsInstalled(): Ref<(id: string) => boolean> {
		const isInstalled = ref((id: string) => Extensions.isInstalled(id))

		const update = () => {
			isInstalled.value = (id: string) => Extensions.isInstalled(id)
		}

		let disposable: Disposable

		onMounted(() => {
			disposable = Extensions.updated.on(update)
		})

		onUnmounted(() => {
			disposable.dispose()
		})

		return isInstalled
	}

	private static async installExtension(extension: ExtensionManifest, path: string) {
		const unzippedExtension = await Extensions.downloadExtension(extension)

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

					console.log(contributeFiles, resultPath)
				}
			}
		}

		await Extensions.loadExtension(path)

		Extensions.updated.dispatch(undefined)
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
		await Extensions.load()
	}

	private static async loadExtension(path: string) {
		const extension = new Extension(path)
		await extension.load()

		Extensions.globalExtensions.push(extension)
	}

	private static async loadProjectExtension(path: string) {
		const extension = new Extension(path)
		await extension.load()

		Extensions.projectExtensions.push(extension)
	}
}

import { compareVersions } from 'bridge-common-utils'
import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { settingsState } from '../../Windows/Settings/SettingsState'
import { App } from '/@/App'
import { loadHandleAsDataURL } from '/@/utils/loadAsDataUrl'

export interface IComMojangPack {
	type: 'behaviorPack' | 'resourcePack'
	uuid?: string
	packPath: string
	manifest: any
	packIcon: string | null
	directoryHandle: AnyDirectoryHandle
}
export interface IComMojangProject {
	name: string
	packs: IComMojangPack[]
}

export class ComMojangProjectLoader {
	protected cachedProjects: IComMojangProject[] | null = null

	constructor(protected app: App) {}

	get comMojang() {
		return this.app.comMojang
	}
	get fileSystem() {
		return this.app.comMojang.fileSystem
	}

	clearCache() {
		this.cachedProjects = null
	}

	async loadProjects() {
		if (!(settingsState?.projects?.loadComMojangProjects ?? true)) {
			this.clearCache()
			return []
		}
		if (this.cachedProjects !== null) return this.cachedProjects

		if (
			!this.comMojang.setup.hasFired ||
			!this.comMojang.status.hasComMojang
		)
			return []

		const behaviorPacks = await this.loadPacks('development_behavior_packs')

		// Fast path: No need to load resource packs if there are no behavior packs
		if (behaviorPacks.size === 0) return []
		const resourcePacks = await this.loadPacks('development_resource_packs')

		const projects: IComMojangProject[] = []
		for (const behaviorPack of behaviorPacks.values()) {
			const dependencies = behaviorPack.manifest?.dependencies
			if (!dependencies) {
				projects.push({
					name: behaviorPack.directoryHandle.name,
					packs: [behaviorPack],
				})
				continue
			}

			let matchingRp
			for (const dep of dependencies) {
				matchingRp = resourcePacks.get(dep.uuid)
				if (matchingRp) break
			}

			if (!matchingRp) continue
			projects.push({
				name: behaviorPack.directoryHandle.name,
				packs: [behaviorPack, matchingRp],
			})
		}

		this.cachedProjects = projects
		return projects
	}

	async loadPacks(
		folderName: 'development_behavior_packs' | 'development_resource_packs'
	) {
		const packs = new Map<string, IComMojangPack>()
		const storePackDir = await this.fileSystem
			.getDirectoryHandle(folderName)
			.catch(() => null)

		if (!storePackDir) return packs

		for await (const packHandle of storePackDir.values()) {
			if (packHandle.kind === 'file') continue

			const manifest = await packHandle
				.getFileHandle('manifest.json')
				.then((fileHandle) =>
					this.fileSystem.readJsonHandle(fileHandle)
				)
				.catch(() => null)
			if (!manifest) continue

			const uuid = manifest?.header?.uuid

			// Check whether BP/RP is part of a v2 project
			if (this.isV2Project(manifest)) continue

			const packIcon = await packHandle
				.getFileHandle('pack_icon.png')
				.then((fileHandle) => loadHandleAsDataURL(fileHandle))
				.catch(() => null)

			packs.set(uuid, {
				type:
					folderName === 'development_behavior_packs'
						? 'behaviorPack'
						: 'resourcePack',
				packPath: `${folderName}/${packHandle.name}`,
				uuid,
				manifest,
				packIcon,
				directoryHandle: packHandle,
			})
		}

		return packs
	}

	isV2Project(manifest: any) {
		const uuid = manifest?.header?.uuid

		const bridgeVersion =
			manifest?.metadata?.generated_with?.bridge?.pop?.()
		if (bridgeVersion && compareVersions(bridgeVersion, '2.0.0', '>='))
			return true

		// Check whether BP is part of a v2 project
		const isV2Project = this.app.projectManager.someProject(
			(project) => !!project.bpUuid && project.bpUuid === uuid
		)
		return isV2Project
	}
}

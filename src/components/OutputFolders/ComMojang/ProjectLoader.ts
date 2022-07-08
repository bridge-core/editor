import { compareVersions } from 'bridge-common-utils'
import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { App } from '/@/App'
import { loadAsDataURL } from '/@/utils/loadAsDataUrl'

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
	constructor(protected app: App) {}

	get comMojang() {
		return this.app.comMojang
	}
	get fileSystem() {
		return this.app.comMojang.fileSystem
	}

	async loadProjects() {
		if (
			!this.comMojang.setup.hasFired ||
			!this.comMojang.status.hasComMojang
		)
			return []

		const behaviorPacks = await this.loadPacks('development_behavior_packs')
		const resourcePacks = await this.loadPacks('development_resource_packs')

		const projects: IComMojangProject[] = []
		for (const behaviorPack of behaviorPacks) {
			const dependencies = behaviorPack.manifest?.dependencies
			if (!dependencies) {
				projects.push({
					name: behaviorPack.directoryHandle.name,
					packs: [behaviorPack],
				})
				continue
			}

			const matchingRp = resourcePacks.find(({ uuid: rpUuuid }) =>
				dependencies.find(
					({ uuid: depUuid }: any) => !!depUuid && depUuid === rpUuuid
				)
			)
			if (!matchingRp) continue
			projects.push({
				name: behaviorPack.directoryHandle.name,
				packs: [behaviorPack, matchingRp],
			})
		}

		return projects
	}

	async loadPacks(
		folderName: 'development_behavior_packs' | 'development_resource_packs'
	) {
		const storePackDir = await this.fileSystem
			.getDirectoryHandle(folderName)
			.catch(() => null)
		if (!storePackDir) return []

		const packs: IComMojangPack[] = []

		for await (const packHandle of storePackDir.values()) {
			if (packHandle.kind === 'file') continue
			const manifest = await this.fileSystem
				.readJSON(`${folderName}/${packHandle.name}/manifest.json`)
				.catch(() => null)
			if (!manifest) continue

			const uuid = manifest?.header?.uuid

			// Check whether BP/RP is part of a v2 project
			if (this.isV2Project(manifest)) continue

			const packIcon = await loadAsDataURL(
				`${folderName}/${packHandle.name}/pack_icon.png`,
				this.fileSystem
			).catch(() => null)

			packs.push({
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

		const bridgeVersion = manifest?.metadata?.generated_with?.bridge?.pop?.()
		if (bridgeVersion && compareVersions(bridgeVersion, '2.0.0', '>='))
			return true

		// Check whether BP is part of a v2 project
		const isV2Project = this.app.projectManager.someProject(
			(project) => !!project.bpUuid && project.bpUuid === uuid
		)
		return isV2Project
	}
}

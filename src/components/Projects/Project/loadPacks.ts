import { App } from '/@/App'
import { IPackType, TPackTypeId } from '/@/components/Data/PackType'
import { loadManifest } from './loadManifest'
import type { Project } from './Project'
import { defaultPackPaths } from './Config'

export interface IPackData extends IPackType {
	version: number[]
	packPath: string
}

export async function loadPacks(app: App, project: Project) {
	await App.packType.ready.fired

	const availablePackIds = <TPackTypeId[]>(
		Object.keys(project.config.get().packs ?? defaultPackPaths)
	)

	const packs: IPackData[] = []

	await Promise.allSettled(
		availablePackIds.map(async (packId) => {
			const packPath = project.config.resolvePackPath(packId)
			if (!(await app.fileSystem.directoryExists(packPath))) return

			// Check whether handle is a valid pack
			const packType = App.packType.getFromId(packId)
			if (!packType) return

			// Load pack manifest
			let manifest: any = {}
			try {
				manifest = await loadManifest(app, packPath)
			} catch {}

			packs.push({
				...packType,
				packPath,
				version: manifest?.header?.version ?? [1, 0, 0],
			})
		})
	)

	return packs
}

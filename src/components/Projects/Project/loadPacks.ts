import { App } from '/@/App'
import { IPackType, TPackTypeId } from '/@/components/Data/PackType'
import { loadManifest } from './loadManifest'
import type { Project } from './Project'

export interface IPackData extends IPackType {
	version: number[]
	packPath: string
}

export async function loadPacks(app: App, project: Project) {
	const packs: IPackData[] = []
	const config = project.config
	const definedPacks = config.getAvailablePacks()

	for (const [packId, packPath] of Object.entries(definedPacks)) {
		// Load pack manifest
		let manifest: any = {}
		try {
			manifest = await loadManifest(app, packPath)
		} catch {}

		packs.push({
			...App.packType.getFromId(<TPackTypeId>packId)!,
			packPath,
			version: manifest?.header?.version ?? [1, 0, 0],
		})
	}

	return packs
}

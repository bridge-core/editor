import { App } from '/@/App'
import { IPackType, PackType, TPackTypeId } from '/@/components/Data/PackType'
import { loadManifest } from './loadManifest'
import type { Project } from './Project'
import { defaultPackPaths } from './Config'

export interface IPackData extends IPackType {
	version: number[]
	packPath: string
}

export async function loadPacks(app: App, project: Project) {
	await PackType.ready.fired

	const availablePackIds = <TPackTypeId[]>(
		Object.keys(project.config.get().packs ?? defaultPackPaths)
	)

	const packs: IPackData[] = []

	for (const packId of availablePackIds) {
		const packPath = project.getFilePath(packId)
		if (!(await app.fileSystem.directoryExists(packPath))) continue

		// Check whether handle is a valid pack
		const packType = PackType.getFromId(packId)
		if (!packType) continue

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
	}

	return packs
}

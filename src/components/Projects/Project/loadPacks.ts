import { App } from '/@/App'
import { IPackType, PackType } from '/@/components/Data/PackType'
import { loadManifest } from './loadManifest'

export interface IPackData extends IPackType {
	version: number[]
}

export async function loadPacks(app: App, projectName: string) {
	const handles = await app.fileSystem.readdir(`projects/${projectName}`, {
		withFileTypes: true,
	})
	const packs: IPackData[] = []

	for (const handle of handles) {
		if (handle.kind !== 'directory') continue

		// Check whether handle is a valid pack
		const packType = PackType.get(`projects/${projectName}/${handle.name}`)
		if (!packType) continue

		// Load pack manifest
		let manifest: any = {}
		try {
			manifest = await loadManifest(app, projectName, handle.name)
		} catch {}

		packs.push({
			...packType,
			version: manifest?.header?.version ?? [1, 0, 0],
		})
	}

	return packs
}

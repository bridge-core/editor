import { App } from '/@/App'
import { compareVersions } from 'bridge-common-utils'
import type { DataLoader } from './DataLoader'

interface IFormatVersionDefs {
	currentStable: string
	formatVersions: string[]
}

export async function getFilteredFormatVersions(targetVersion?: string) {
	const app = await App.getApp()
	await app.dataLoader.fired

	await app.projectManager.projectReady.fired
	if (!targetVersion) targetVersion = app.projectConfig.get().targetVersion

	return getFormatVersions().then((formatVersions) =>
		formatVersions.filter(
			(formatVersion) =>
				!targetVersion ||
				compareVersions(formatVersion, targetVersion, '<=')
		)
	)
}
export async function getFormatVersions() {
	const app = await App.getApp()
	await app.dataLoader.fired

	const def: IFormatVersionDefs = await app.dataLoader.readJSON(
		'data/packages/minecraftBedrock/formatVersions.json'
	)

	return def.formatVersions.reverse()
}

export function getLatestFormatVersion() {
	return getFormatVersions().then((formatVersions) => formatVersions[0])
}

export async function getStableFormatVersion(dataLoader: DataLoader) {
	await dataLoader.fired

	const def: IFormatVersionDefs = await dataLoader.readJSON(
		'data/packages/minecraftBedrock/formatVersions.json'
	)

	return def.currentStable
}

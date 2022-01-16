import { App } from '/@/App'
import { compareVersions } from 'bridge-common-utils'

export async function getFilteredFormatVersions(targetVersion?: string) {
	const app = await App.getApp()
	await app.dataLoader.fired

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

	const formatVersions: string[] = await app.dataLoader.readJSON(
		'data/packages/minecraftBedrock/formatVersions.json'
	)

	return formatVersions.reverse()
}

export function getLatestFormatVersion() {
	return getFormatVersions().then((formatVersions) => formatVersions[0])
}

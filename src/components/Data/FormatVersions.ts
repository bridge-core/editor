import { App } from '/@/App'
import { compare } from 'compare-versions'

export async function getFilteredFormatVersions(useVersions?: string[]) {
	const app = await App.getApp()
	await app.dataLoader.fired

	const targetVersion: string | undefined =
		useVersions ?? (await app.projectConfig.get('targetVersion'))
	const formatVersions: string[] = await app.fileSystem.readJSON(
		'data/packages/formatVersions.json'
	)

	return formatVersions.filter(
		formatVersion =>
			!targetVersion || compare(formatVersion, targetVersion, '<=')
	)
}

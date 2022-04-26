import { App } from '/@/App'
import { dashVersion } from '/@/utils/app/dashVersion'
import { version as appVersion } from '/@/utils/app/version'

export async function loadManifest(app: App, packPath: string) {
	const manifestPath = `${packPath}/manifest.json`
	let manifest = await app.fileSystem.readJSON(manifestPath)

	let generatedWithBridge: string[] =
		manifest?.metadata?.generated_with?.bridge ?? []
	let generatedWithDash: string[] =
		manifest?.metadata?.generated_with?.dash ?? []

	let updatedManifest = false
	if (
		!generatedWithBridge.includes(appVersion) ||
		generatedWithBridge.length > 1
	) {
		generatedWithBridge = [appVersion]
		updatedManifest = true
	}
	if (
		!generatedWithDash.includes(dashVersion) ||
		generatedWithDash.length > 1
	) {
		generatedWithDash = [dashVersion]
		updatedManifest = true
	}

	if (updatedManifest) {
		manifest = {
			...(manifest ?? {}),
			metadata: {
				...(manifest?.metadata ?? {}),
				generated_with: {
					...(manifest?.metadata?.generated_with ?? {}),
					...{ bridge: [appVersion], dash: [dashVersion] },
				},
			},
		}

		await app.fileSystem.writeJSON(manifestPath, manifest, true)
	}
	return manifest
}

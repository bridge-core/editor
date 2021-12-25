import { App } from '/@/App'
import { dashVersion } from '/@/utils/app/dashVersion'
import { version as appVersion } from '/@/utils/app/version'

export async function loadManifest(app: App, packPath: string) {
	const manifestPath = `${packPath}/manifest.json`
	let manifest = await app.fileSystem.readJSON(manifestPath)

	const generatedWithBridge: string[] | undefined =
		manifest?.metadata?.generated_with?.bridge
	const generatedWithDash: string[] | undefined =
		manifest?.metadata?.generated_with?.dash

	let updatedManifest = false
	if (generatedWithBridge) {
		if (!generatedWithBridge.includes(appVersion)) {
			generatedWithBridge.push(appVersion)
			updatedManifest = true
		}
	}
	if (generatedWithDash) {
		if (!generatedWithDash.includes(dashVersion)) {
			generatedWithDash.push(dashVersion)
			updatedManifest = true
		}
	}
	if (!generatedWithBridge || !generatedWithDash) {
		manifest = {
			...(manifest ?? {}),
			metadata: {
				...(manifest?.metadata ?? {}),
				generated_with: {
					...(manifest?.metadata?.generated_with ?? {}),
					...(!generatedWithBridge
						? { bridge: [appVersion] }
						: { dash: [dashVersion] }),
				},
			},
		}
		updatedManifest = true
	}

	if (updatedManifest)
		await app.fileSystem.writeJSON(manifestPath, manifest, true)
	return manifest
}

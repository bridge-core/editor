import { settingsState } from '../../Windows/Settings/SettingsState'
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
	// Check that the user wants to add the generated_with section
	if (settingsState?.projects?.addGeneratedWith ?? true) {
		// Update generated_with bridge. version
		if (
			!generatedWithBridge.includes(appVersion) ||
			generatedWithBridge.length > 1
		) {
			generatedWithBridge = [appVersion]
			updatedManifest = true
		}

		// Update generated_with dash version
		if (
			!generatedWithDash.includes(dashVersion) ||
			generatedWithDash.length > 1
		) {
			generatedWithDash = [dashVersion]
			updatedManifest = true
		}
	}

	// If the manifest changed, save changes to disk
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

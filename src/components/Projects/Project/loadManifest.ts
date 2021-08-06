import { App } from '/@/App'
import { version as appVersion } from '/@/appVersion.json'

export async function loadManifest(
	app: App,
	projectName: string,
	packPath: string
) {
	const manifestPath = `projects/${projectName}/${packPath}/manifest.json`
	let manifest = await app.fileSystem.readJSON(manifestPath)

	const generatedWithBridge: string[] | undefined =
		manifest?.metadata?.generated_with?.bridge

	let updatedManifest = false
	if (generatedWithBridge) {
		if (!generatedWithBridge.includes(appVersion)) {
			generatedWithBridge.push(appVersion)
			updatedManifest = true
		}
	} else {
		manifest = {
			...(manifest ?? {}),
			metadata: {
				...(manifest?.metadata ?? {}),
				generated_with: {
					...(manifest?.metadata?.generated_with ?? {}),
					bridge: [appVersion],
				},
			},
		}
		updatedManifest = true
	}

	if (updatedManifest)
		await app.fileSystem.writeJSON(manifestPath, manifest, true)
	return manifest
}

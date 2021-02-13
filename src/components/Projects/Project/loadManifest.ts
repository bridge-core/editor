import { App } from '@/App'

export function loadManifest(app: App, projectName: string, packPath: string) {
	return app.fileSystem.readJSON(
		`projects/${projectName}/${packPath}/manifest.json`
	)
}

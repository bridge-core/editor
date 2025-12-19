import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { AlertWindow } from '@/components/Windows/Alert/AlertWindow'
import { Windows } from '@/components/Windows/Windows'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { LocaleManager } from '@/libs/locales/Locales'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { appVersion, dashVersion } from '@/libs/app/AppEnv'
import { LocalFileSystem } from '@/libs/fileSystem/LocalFileSystem'
import { download } from '@/libs/Download'
import { basename } from 'pathe'
import { TauriFileSystem } from '@/libs/fileSystem/TauriFileSystem'

export async function saveOrDownload(path: string, data: Uint8Array, fileSystem: BaseFileSystem) {
	await fileSystem.writeFile(path, data)

	NotificationSystem.addNotification(
		'download',
		async () => {
			if (fileSystem instanceof LocalFileSystem) {
				download(basename(path), data)
			} else if (fileSystem instanceof TauriFileSystem) {
				fileSystem.revealInFileExplorer(path)
			} else {
				Windows.open(new AlertWindow(`[${LocaleManager.translate('general.successfulExport.description')}: "${path}"]`))
			}
		},
		'success'
	)
}

export async function incrementManifestVersions() {
	if (!ProjectManager.currentProject) return
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return

	let manifests: Record<string, any> = {}

	for (const pack of Object.keys(ProjectManager.currentProject.packs)) {
		const manifestPath = ProjectManager.currentProject.resolvePackPath(pack, 'manifest.json')

		if (await fileSystem.exists(manifestPath)) {
			let manifest

			try {
				manifest = await fileSystem.readFileJson(manifestPath)
			} catch {
				continue
			}

			const [major, minor, patch] = <[number, number, number]>manifest.header?.version ?? [0, 0, 0]

			const newVersion = [major, minor, patch + 1]

			manifests[manifestPath] = {
				...manifest,
				header: {
					...(manifest.header ?? {}),
					version: newVersion,
				},
			}
		}
	}

	const allManifests = Object.values(manifests)

	for (const manifest of allManifests) {
		if (!Array.isArray(manifest.dependencies)) continue

		manifest.dependencies.forEach((dep: any) => {
			const depManifest = allManifests.find((manifest) => manifest.header.uuid === dep.uuid)

			if (!depManifest) return

			dep.version = depManifest.header.version
		})
	}

	const announcement = fileSystem.announceFileModifications()

	try {
		for (const [path, manifest] of Object.entries(manifests)) {
			await fileSystem.writeFileJson(path, manifest, true)
		}
	} catch {}

	announcement.dispose()
}

export async function addGeneratedWith() {
	if (!ProjectManager.currentProject) return
	if (!(ProjectManager.currentProject instanceof BedrockProject)) return

	let manifests: Record<string, any> = {}

	for (const pack of Object.keys(ProjectManager.currentProject.packs)) {
		const manifestPath = ProjectManager.currentProject.resolvePackPath(pack, 'manifest.json')

		if (await fileSystem.exists(manifestPath)) {
			let manifest

			try {
				manifest = await fileSystem.readFileJson(manifestPath)
			} catch {
				continue
			}

			const [major, minor, patch] = <[number, number, number]>manifest.header?.version ?? [0, 0, 0]

			const newVersion = [major, minor, patch + 1]

			manifests[manifestPath] = {
				...manifest,
				metadata: {
					...(manifest.metadata ?? {}),
					generated_with: {
						...(manifest.metadata?.generated_with ?? {}),
						bridge: [appVersion],
						dash: [dashVersion],
					},
				},
			}
		}
	}

	const announcement = fileSystem.announceFileModifications()

	try {
		for (const [path, manifest] of Object.entries(manifests)) {
			await fileSystem.writeFileJson(path, manifest, true)
		}
	} catch {}

	announcement.dispose()
}

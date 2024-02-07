import { data, extensions, windows } from '@/App'
import { Ref, ref } from 'vue'
import { ExtensionManifest } from '@/libs/extensions/Extensions'

export class ExtensionLibrary {
	public tags: Record<string, { icon: string; color?: string }> = {}
	public selectedTag: Ref<string> = ref('All')
	public extensions: ExtensionManifest[] = []

	private extensionToInstall?: ExtensionManifest

	public async load() {
		this.tags = await data.get('packages/common/extensionTags.json')

		this.selectedTag.value = Object.keys(this.tags)[0]

		this.extensions = await (
			await fetch('https://raw.githubusercontent.com/bridge-core/plugins/master/extensions.json')
		).json()
	}

	public async open() {
		await this.load()

		windows.open('extensionLibrary')
	}

	public requestInstall(extension: ExtensionManifest) {
		this.extensionToInstall = extension

		windows.open('extensionInstallLocation')
	}

	public confirmInstallGlobal() {
		if (this.extensionToInstall === undefined) return

		extensions.installGlobal(this.extensionToInstall)
	}

	public confirmInstallProject() {
		if (this.extensionToInstall === undefined) return

		extensions.installProject(this.extensionToInstall)
	}
}

import { extensions } from '@/App'
import { Windows } from '@/components/Windows/Windows'
import { Ref, ref } from 'vue'
import { ExtensionManifest } from '@/libs/extensions/Extensions'
import { Data } from '@/libs/data/Data'

export class ExtensionLibrary {
	public tags: Record<string, { icon: string; color?: string }> = {}
	public selectedTag: Ref<string> = ref('All')
	public extensions: ExtensionManifest[] = []

	private extensionToInstall?: ExtensionManifest

	public async load() {
		this.tags = await Data.get('packages/common/extensionTags.json')

		this.selectedTag.value = Object.keys(this.tags)[0]

		this.extensions = await (
			await fetch('https://raw.githubusercontent.com/bridge-core/plugins/master/extensions.json')
		).json()
	}

	public async open() {
		await this.load()

		Windows.open('extensionLibrary')
	}

	public requestInstall(extension: ExtensionManifest) {
		this.extensionToInstall = extension

		Windows.open('extensionInstallLocation')
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

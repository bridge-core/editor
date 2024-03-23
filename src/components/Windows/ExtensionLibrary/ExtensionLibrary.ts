import { Windows } from '@/components/Windows/Windows'
import { Ref, ref } from 'vue'
import { ExtensionManifest } from '@/libs/extensions/Extension'
import { Data } from '@/libs/data/Data'
import { Extensions } from '@/libs/extensions/Extensions'
import { Window } from '@/components/Windows/Window'
import ExtensionInstallLocation from './ExtensionInstallLocation.vue'

class ExtensionInstallLocationWindow extends Window {
	public static id = 'extensionInstallLocationWindow'
	public static component = ExtensionInstallLocation
}

export class ExtensionLibrary extends Window {
	public static tags: Record<string, { icon: string; color?: string }> = {}
	public static selectedTag: Ref<string> = ref('All')
	public static extensions: ExtensionManifest[] = []

	private static extensionToInstall?: ExtensionManifest

	public static id = 'extensionLibrary'
	public static component = ExtensionLibrary

	public static async load() {
		ExtensionLibrary.tags = await Data.get('packages/common/extensionTags.json')

		ExtensionLibrary.selectedTag.value = Object.keys(ExtensionLibrary.tags)[0]

		ExtensionLibrary.extensions = await (
			await fetch('https://raw.githubusercontent.com/bridge-core/plugins/master/extensions.json')
		).json()
	}

	public static async open() {
		await ExtensionLibrary.load()

		Windows.open(ExtensionLibrary)
	}

	public static requestInstall(extension: ExtensionManifest) {
		ExtensionLibrary.extensionToInstall = extension

		Windows.open(ExtensionInstallLocationWindow)
	}

	public static confirmInstallGlobal() {
		if (ExtensionLibrary.extensionToInstall === undefined) return

		Extensions.installGlobal(ExtensionLibrary.extensionToInstall)
	}

	public static confirmInstallProject() {
		if (ExtensionLibrary.extensionToInstall === undefined) return

		Extensions.installProject(ExtensionLibrary.extensionToInstall)
	}
}

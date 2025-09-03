import { Windows } from '@/components/Windows/Windows'
import { Ref, ref } from 'vue'
import { ExtensionManifest } from '@/libs/extensions/Extension'
import { Data } from '@/libs/data/Data'
import { Extensions } from '@/libs/extensions/Extensions'
import { Window } from '@/components/Windows/Window'
import { InformedChoiceWindow } from '@/components/Windows/InformedChoice/InformedChoiceWindow'
import ExtensionLibrary from './ExtensionLibrary.vue'

export class ExtensionLibraryWindow extends Window {
	public static tags: Record<string, { icon: string; color?: string }> = {}
	public static selectedTag: Ref<string> = ref('All')
	public static extensions: ExtensionManifest[] = []

	private static extensionToInstall?: ExtensionManifest

	public static id = 'extensionLibrary'
	public static component = ExtensionLibrary

	public static async load() {
		ExtensionLibraryWindow.tags = await Data.get('packages/common/extensionTags.json')

		ExtensionLibraryWindow.selectedTag.value = Object.keys(ExtensionLibraryWindow.tags)[0]

		ExtensionLibraryWindow.extensions = await (
			await fetch('https://raw.githubusercontent.com/bridge-core/plugins/master/extensions.json')
		).json()
	}

	public static async open() {
		await ExtensionLibraryWindow.load()

		Windows.open(ExtensionLibraryWindow)
	}

	public static requestInstall(extension: ExtensionManifest) {
		ExtensionLibraryWindow.extensionToInstall = extension

		Windows.open(
			new InformedChoiceWindow('Extension Install Location', [
				{
					icon: 'public',
					name: 'Install Globally',
					description: 'Global extensions are accessible to all of your projects',
					choose: () => {
						ExtensionLibraryWindow.confirmInstallGlobal()
					},
				},
				{
					icon: 'folder',
					name: 'Install Locally',
					description: 'Local extensions are accessible to only the projects you install them to',
					choose: () => {
						ExtensionLibraryWindow.confirmInstallProject()
					},
				},
			])
		)
	}

	public static confirmInstallGlobal() {
		if (ExtensionLibraryWindow.extensionToInstall === undefined) return

		Extensions.installGlobal(ExtensionLibraryWindow.extensionToInstall)
	}

	public static confirmInstallProject() {
		if (ExtensionLibraryWindow.extensionToInstall === undefined) return

		Extensions.installProject(ExtensionLibraryWindow.extensionToInstall)
	}
}

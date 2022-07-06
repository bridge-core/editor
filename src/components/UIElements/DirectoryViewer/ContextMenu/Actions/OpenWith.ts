import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { ISubmenuConfig } from '/@/components/ContextMenu/showContextMenu'
import { HTMLPreviewerAction } from './OpenWith/HTMLPreviewer'
import { TreeEditorAction } from './OpenWith/TreeEditor'
import { TextEditorAction } from './OpenWith/TextEditor'
import { SnowstormAction } from './OpenWith/Snowstorm'
import { AnyFileHandle } from '/@/components/FileSystem/Types'

export const pluginActionStore = new Set<IPluginOpenWithAction>()

export interface IPluginOpenWithAction {
	icon: string
	name: string
	isAvailable?: (details: IOpenWithDetails) => Promise<boolean> | boolean
	onOpen: (details: IOpenWithDetails) => Promise<void> | void
}
interface IOpenWithDetails {
	fileHandle: AnyFileHandle
	filePath: string | null
}

export const OpenWithAction = async (fileWrapper: FileWrapper) => {
	// Default bridge. actions
	const defaultActions = [
		TextEditorAction(fileWrapper),
		TreeEditorAction(fileWrapper),
		HTMLPreviewerAction(fileWrapper),
	].filter((action) => action !== null)

	// Actions which open an external tool
	const externalActions = [
		SnowstormAction(fileWrapper),
		// {
		// 	icon: 'mdi-cube-outline',
		// 	name: 'openWith.blockbench',
		// 	onTrigger: async () => {},
		// },
	].filter((action) => action !== null)

	// Load actions provided by plugins
	for (const action of pluginActionStore) {
		const details = {
			fileHandle: fileWrapper.handle,
			filePath: fileWrapper.path,
		}
		if (!((await action.isAvailable?.(details)) ?? true)) continue

		externalActions.push({
			icon: action.icon,
			name: action.name,
			onTrigger: async () => {
				await action.onOpen(details)
			},
		})
	}

	// Construct and return submenu
	return <ISubmenuConfig>{
		type: 'submenu',
		icon: 'mdi-open-in-app',
		name: 'windows.packExplorer.fileActions.openWith.name',
		description: 'windows.packExplorer.fileActions.openWith.description',

		actions: [
			...defaultActions,
			defaultActions.length > 0 && externalActions.length > 0
				? { type: 'divider' }
				: null,
			...externalActions,
		],
	}
}

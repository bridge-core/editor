import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { ISubmenuConfig } from '/@/components/ContextMenu/showContextMenu'
import { HTMLPreviewerAction } from './OpenWith/HTMLPreviewer'
import { TreeEditorAction } from './OpenWith/TreeEditor'
import { TextEditorAction } from './OpenWith/TextEditor'
import { SnowstormAction } from './OpenWith/Snowstorm'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { BlockbenchAction } from './OpenWith/Blockbench'

export const pluginActionStore = new Set<IPluginOpenWithAction>()

export interface IPluginOpenWithAction {
	icon: string
	name: string
	isAvailable?: (details: IOpenWithDetails) => Promise<boolean> | boolean
	onOpen: (details: IOpenWithDetails) => Promise<void> | void
}
interface IOpenWithDetails {
	isReadOnly?: boolean
	fileHandle: AnyFileHandle
	filePath: string | null
}

export const OpenWithAction = async (fileWrapper: FileWrapper) => {
	// Default bridge. actions
	const defaultActions = [
		TextEditorAction(fileWrapper),
		TreeEditorAction(fileWrapper),
		HTMLPreviewerAction(fileWrapper.handle, fileWrapper.path ?? undefined),
	].filter((action) => action !== null)

	// Actions which open an external tool
	const externalActions = [
		SnowstormAction(fileWrapper),
		BlockbenchAction(fileWrapper),
	].filter((action) => action !== null)

	// Load actions provided by plugins
	for (const action of pluginActionStore) {
		const details = {
			isReadOnly: fileWrapper.options.isReadOnly,
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

	const actions = [
		...defaultActions,
		defaultActions.length > 0 && externalActions.length > 0
			? { type: 'divider' }
			: null,
		...externalActions,
	].filter((action) => action !== null)

	if (actions.length <= 1) return null

	// Construct and return submenu
	return <ISubmenuConfig>{
		type: 'submenu',
		icon: 'mdi-open-in-app',
		name: 'actions.openWith.name',

		actions,
	}
}

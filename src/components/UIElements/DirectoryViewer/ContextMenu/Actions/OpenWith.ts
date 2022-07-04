import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { ISubmenuConfig } from '/@/components/ContextMenu/showContextMenu'
import { HTMLPreviewerAction } from './OpenWith/HTMLPreviewer'
import { TreeEditorAction } from './OpenWith/TreeEditor'
import { TextEditorAction } from './OpenWith/TextEditor'
import { SnowstormAction } from './OpenWith/Snowstorm'

export const OpenWithAction = (fileWrapper: FileWrapper) => {
	const defaultActions = [
		TextEditorAction(fileWrapper),
		TreeEditorAction(fileWrapper),
		HTMLPreviewerAction(fileWrapper),
	].filter((action) => action !== null)
	const externalActions = [
		SnowstormAction(fileWrapper),
		{
			icon: 'mdi-cube-outline',
			name: 'openWith.blockbench',
			onTrigger: async () => {},
		},
	].filter((action) => action !== null)

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

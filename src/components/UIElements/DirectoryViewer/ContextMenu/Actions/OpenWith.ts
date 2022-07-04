import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'
import { ISubmenuConfig } from '/@/components/ContextMenu/showContextMenu'

export const OpenWithAction = (fileWrapper: FileWrapper) =>
	<ISubmenuConfig>{
		type: 'submenu',
		icon: 'mdi-open-in-app',
		name: 'windows.packExplorer.fileActions.openWith.name',
		description: 'windows.packExplorer.fileActions.openWith.description',

		actions: [
			{
				icon: 'mdi-pencil-outline',
				name: '[Text Editor]',
				onTrigger: async () => {},
			},
			{
				icon: 'mdi-file-tree-outline',
				name: '[Tree Editor]',
				onTrigger: async () => {},
			},
			{ type: 'divider' },
			{
				icon: 'mdi-snowflake',
				name: '[Snowstorm]',
				onTrigger: async () => {},
			},
			{
				icon: 'mdi-cube-outline',
				name: '[Blockbench]',
				onTrigger: async () => {},
			},
		],
	}

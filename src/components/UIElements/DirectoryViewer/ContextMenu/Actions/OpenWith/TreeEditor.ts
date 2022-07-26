import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'
import { TreeTab } from '/@/components/Editors/TreeEditor/Tab'

export const TreeEditorAction = (fileWrapper: FileWrapper) =>
	fileWrapper.name.endsWith('.json')
		? {
				icon: 'mdi-file-tree-outline',
				name: 'openWith.treeEditor',
				onTrigger: async () => {
					const app = await App.getApp()
					const tabSystem = app.tabSystem
					if (!tabSystem) return

					tabSystem.add(
						new TreeTab(
							tabSystem,
							fileWrapper.handle,
							fileWrapper.options.isReadOnly ? 'forced' : 'off'
						)
					)
				},
		  }
		: null

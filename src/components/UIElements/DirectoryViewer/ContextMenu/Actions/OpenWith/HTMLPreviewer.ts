import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'
import { HTMLPreviewTab } from '/@/components/Editors/HTMLPreview/HTMLPreview'
import { AnyFileHandle } from '/@/components/FileSystem/Types'

export const HTMLPreviewerAction = (
	fileHandle: AnyFileHandle,
	filePath?: string
) =>
	fileHandle.name.endsWith('.html')
		? {
				icon: 'mdi-language-html5',
				name: 'openWith.htmlPreviewer',
				onTrigger: async () => {
					const app = await App.getApp()
					const tabSystem = app.tabSystem
					if (!tabSystem) return

					tabSystem.add(
						new HTMLPreviewTab(tabSystem, {
							fileHandle: fileHandle,
							filePath: filePath ?? undefined,
						})
					)
				},
		  }
		: null

import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'
import { HTMLPreviewTab } from '/@/components/Editors/HTMLPreview/HTMLPreview'

export const HTMLPreviewerAction = (fileWrapper: FileWrapper) =>
	fileWrapper.name.endsWith('.html') && fileWrapper.path
		? {
				icon: 'mdi-language-html5',
				name: 'HTML Previewer',
				description: 'Preview this HTML file in a new tab',
				onTrigger: async () => {
					const app = await App.getApp()
					const tabSystem = app.tabSystem
					if (!tabSystem) return

					tabSystem.add(
						new HTMLPreviewTab(tabSystem, {
							fileHandle: fileWrapper.handle,
							filePath: fileWrapper.path!,
						})
					)
				},
		  }
		: null

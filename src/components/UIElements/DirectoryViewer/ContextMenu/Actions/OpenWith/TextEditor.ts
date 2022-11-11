import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'
import { extname } from '/@/utils/path'
import { TextTab } from '/@/components/Editors/Text/TextTab'

const textEditorNotAllowed = [
	'.png',
	'.jpg',
	'.jpeg',
	'.tga',
	'.fsb',
	'.wav',
	'.ogg',
]

export const TextEditorAction = (fileWrapper: FileWrapper) => {
	const ext = extname(fileWrapper.name)
	if (textEditorNotAllowed.includes(ext)) return null

	return {
		icon: 'mdi-pencil-outline',
		name: 'openWith.textEditor',
		onTrigger: async () => {
			const app = await App.getApp()
			const tabSystem = app.tabSystem
			if (!tabSystem) return

			tabSystem.add(
				new TextTab(
					tabSystem,
					fileWrapper.handle,
					fileWrapper.options.isReadOnly ? 'forced' : 'off'
				)
			)
		},
	}
}

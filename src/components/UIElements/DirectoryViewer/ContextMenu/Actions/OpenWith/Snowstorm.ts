import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'

export const SnowstormAction = (fileWrapper: FileWrapper) => {
	if (!fileWrapper.name.endsWith('.json')) return null
	const path = fileWrapper.path
	if (!path) return null

	const fileType = App.fileType.getId(path)

	if (
		fileType === 'particle' ||
		(fileType === 'unknown' && path.includes('particles/'))
	)
		return {
			icon: 'mdi-snowflake',
			name: 'Snowstorm',
			onTrigger: async () => {
				const app = await App.getApp()
				const tabSystem = app.tabSystem
				if (!tabSystem) return
			},
		}

	return null
}

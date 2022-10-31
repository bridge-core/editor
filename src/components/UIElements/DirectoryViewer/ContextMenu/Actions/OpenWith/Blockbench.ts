import { FileWrapper } from '../../../FileView/FileWrapper'
import { App } from '/@/App'
import { IframeTab } from '/@/components/Editors/IframeTab/IframeTab'

export const blockbenchUrl = import.meta.env.DEV
	? 'http://localhost:5173'
	: 'https://blockbench.bridge-core.app'

export const BlockbenchAction = (fileWrapper: FileWrapper) => {
	return fileWrapper.path?.includes('/models/')
		? {
				icon: '$blockbench',
				name: 'openWith.blockbench',
				onTrigger: async () => {
					const app = await App.getApp()
					const tabSystem = app.tabSystem

					if (!tabSystem) return

					const tab = new IframeTab(tabSystem, {
						icon: '$blockbench',
						name: 'Blockbench',
						url: blockbenchUrl,
						iconColor: 'primary',
						openWithPayload: {
							fileHandle: fileWrapper.handle,
							filePath: fileWrapper.path ?? undefined,
						},
					})
					tabSystem.add(tab)
				},
		  }
		: null
}

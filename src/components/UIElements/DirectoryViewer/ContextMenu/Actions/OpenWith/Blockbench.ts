import { FileWrapper } from '../../../FileView/FileWrapper'
import { App } from '/@/App'
import { BlockbenchTab } from '/@/components/Editors/Blockbench/BlockbenchTab'
import { IframeTab } from '/@/components/Editors/IframeTab/IframeTab'

export const BlockbenchAction = (fileWrapper: FileWrapper) => {
	return fileWrapper.path?.includes('/models/')
		? {
				icon: '$blockbench',
				name: 'openWith.blockbench',
				onTrigger: async () => {
					const app = await App.getApp()
					const tabSystem = app.tabSystem

					if (!tabSystem) return

					const tab = new BlockbenchTab(tabSystem, {
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

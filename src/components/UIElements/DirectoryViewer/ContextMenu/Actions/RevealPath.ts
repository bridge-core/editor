import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export const RevealFilePathAction = (baseWrapper: BaseWrapper<any>) =>
	isUsingFileSystemPolyfill.value
		? null
		: {
				icon:
					baseWrapper.kind === 'directory'
						? 'mdi-folder-marker-outline'
						: 'mdi-file-marker-outline',
				name: 'actions.revealPath.name',
				onTrigger: async () => {
					new InformationWindow({
						name: 'actions.revealPath.name',
						description: `[${baseWrapper.path}]`,
						isPersistent: false,
					}).open()
				},
		  }

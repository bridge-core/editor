import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export const RevealFilePathAction = (baseWrapper: BaseWrapper<any>) => ({
	icon: 'mdi-eye-outline',
	name: 'windows.packExplorer.fileActions.revealFilePath.name',
	description: 'windows.packExplorer.fileActions.revealFilePath.description',
	onTrigger: async () => {
		new InformationWindow({
			name: 'windows.packExplorer.fileActions.revealFilePath.name',
			description: `[${baseWrapper.path}]`,
			isPersistent: false,
		}).open()
	},
})

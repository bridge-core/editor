import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export const RevealFilePathAction = (baseWrapper: BaseWrapper<any>) => ({
	icon: 'mdi-eye-outline',
	name: 'actions.revealFilePath.name',
	description: 'actions.revealFilePath.description',
	onTrigger: async () => {
		new InformationWindow({
			name: 'actions.revealFilePath.name',
			description: `[${baseWrapper.path}]`,
			isPersistent: false,
		}).open()
	},
})

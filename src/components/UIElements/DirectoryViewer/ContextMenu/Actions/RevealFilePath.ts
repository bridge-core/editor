import { BaseWrapper } from '../../Common/BaseWrapper'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export const RevealFilePathAction = (baseWrapper: BaseWrapper<any>) => ({
	icon: 'mdi-eye-outline',
	name: 'Reveal File Path',
	onTrigger: async () => {
		new InformationWindow({
			name: 'windows.packExplorer.fileActions.revealFilePath.name',
			description: `[${baseWrapper.path}]`,
			isPersistent: false,
		}).open()
	},
})

import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'

export const RenameAction = (baseWrapper: BaseWrapper<any>) => ({
	icon: 'mdi-pencil-outline',
	name: 'windows.packExplorer.fileActions.rename.name',
	description: 'windows.packExplorer.fileActions.rename.description',
	onTrigger: () => {
		baseWrapper.isEditingName.value = true
	},
})

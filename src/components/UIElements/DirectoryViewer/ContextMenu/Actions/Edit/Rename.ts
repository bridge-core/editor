import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'

export const RenameAction = (baseWrapper: BaseWrapper<any>) => ({
	icon: 'mdi-pencil-outline',
	name: 'actions.rename.name',

	onTrigger: () => {
		baseWrapper.isEditingName.value = true
	},
})

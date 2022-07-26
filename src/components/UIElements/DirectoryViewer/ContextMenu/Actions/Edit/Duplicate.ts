import { clipboard } from './Copy'
import { PasteAction } from './Paste'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'

export const DuplicateAction = (baseWrapper: BaseWrapper<any>) => ({
	icon: 'mdi-content-duplicate',
	name: 'actions.duplicate.name',

	onTrigger: async () => {
		const parent = baseWrapper.getParent()
		if (!parent) return

		clipboard.item = baseWrapper.handle

		const newHandle = await PasteAction(parent).onTrigger()
		if (!newHandle) return

		const newWrapper = parent.getChild(newHandle.name)
		if (!newWrapper) return

		newWrapper.isEditingName.value = true
	},
})

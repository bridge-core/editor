import { App } from '/@/App'
import { AnyHandle } from '/@/components/FileSystem/Types'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'

interface IClipboard {
	item: AnyHandle | null
}
export const clipboard: IClipboard = {
	item: null,
}

export const CopyAction = (baseWrapper: BaseWrapper<any>) => ({
	icon: 'mdi-content-copy',
	name: 'actions.copy.name',
	description: 'actions.copy.description',
	onTrigger: async () => {
		clipboard.item = baseWrapper.handle
	},
})

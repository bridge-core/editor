import { DirectoryWrapper } from '/@/components/UIElements/DirectoryViewer/DirectoryView/DirectoryWrapper'

export const RefreshAction = (directoryWrapper: DirectoryWrapper) => ({
	icon: 'mdi-refresh',
	name: 'general.refresh',

	onTrigger: () => {
		directoryWrapper.refresh()
	},
})

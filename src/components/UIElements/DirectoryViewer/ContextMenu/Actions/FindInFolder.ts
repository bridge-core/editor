import { DirectoryWrapper } from '../../DirectoryView/DirectoryWrapper'
import { App } from '/@/App'
import { searchType } from '/@/components/FindAndReplace/Controls/searchType'
import { FindAndReplaceTab } from '/@/components/FindAndReplace/Tab'

export const FindInFolderAction = (directoryWrapper: DirectoryWrapper) => ({
	icon: 'mdi-file-search-outline',
	name: 'actions.findInFolder.name',

	onTrigger: async () => {
		const app = await App.getApp()
		const project = app.project

		project.tabSystem?.add(
			new FindAndReplaceTab(
				project.tabSystem!,
				[
					{
						directory: directoryWrapper.handle,
						path: directoryWrapper.path ?? '',
					},
				],
				{
					searchType: searchType.matchCase,
					isReadOnly: directoryWrapper.options.isReadOnly,
				}
			)
		)
	},
})

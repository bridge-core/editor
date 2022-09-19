import { DirectoryWrapper } from '../../DirectoryView/DirectoryWrapper'
import { moveHandle } from '/@/utils/file/moveHandle'

export const ImportFileAction = (baseWrapper: DirectoryWrapper) => ({
	icon: 'mdi-import',
	name: 'actions.importFile.name',
	onTrigger: async () => {
		const fileHandles = await window.showOpenFilePicker({
			multiple: true,
		})

		for (const fileHandle of fileHandles) {
			await moveHandle({
				moveHandle: fileHandle,
				toHandle: baseWrapper.handle,
			})
		}

		// Refresh pack explorer UI
		await baseWrapper.refresh()

		// No path information -> no way to update files
		if (baseWrapper.path === null) return

		// Update compiler output & lightning cache
		const newFilePaths = fileHandles.map(
			(fileHandle) => `${baseWrapper.path}/${fileHandle.name}`
		)
		baseWrapper.onFilesAdded(newFilePaths)
	},
})

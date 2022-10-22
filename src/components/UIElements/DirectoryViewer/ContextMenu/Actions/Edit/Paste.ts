import { DirectoryWrapper } from '../../../DirectoryView/DirectoryWrapper'
import { clipboard } from './Copy'
import {
	findSuitableFileName,
	findSuitableFolderName,
} from '/@/utils/directory/findSuitableName'
import { App } from '/@/App'
import { AnyHandle } from '/@/components/FileSystem/Types'

export const PasteAction = (directoryWrapper: DirectoryWrapper) => ({
	icon: 'mdi-content-paste',
	name: 'actions.paste.name',

	onTrigger: async () => {
		if (directoryWrapper.options.isReadOnly) return

		if (!clipboard.item) return
		const handleToPaste = clipboard.item

		const app = await App.getApp()
		const project = app.project

		if (!directoryWrapper.isOpen.value) await directoryWrapper.open()

		let newHandle: AnyHandle
		if (handleToPaste.kind === 'file') {
			const newName = await findSuitableFileName(
				handleToPaste.name,
				directoryWrapper.handle
			)

			newHandle = await directoryWrapper.handle.getFileHandle(newName, {
				create: true,
			})
			await app.fileSystem.copyFileHandle(handleToPaste, newHandle)
		} else if (handleToPaste.kind === 'directory') {
			app.windows.loadingWindow.open()

			const newName = await findSuitableFolderName(
				handleToPaste.name,
				directoryWrapper.handle
			)

			newHandle = await directoryWrapper.handle.getDirectoryHandle(
				newName,
				{ create: true }
			)
			await app.fileSystem.copyFolderByHandle(handleToPaste, newHandle)

			app.windows.loadingWindow.close()
		} else {
			// @ts-ignore
			throw new Error('Invalid handle kind: ' + handleToPaste.kind)
		}

		await directoryWrapper.refresh()
		if (newHandle) await project.updateHandle(newHandle)
		return newHandle
	},
})

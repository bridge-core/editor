import { App } from '/@/App'
import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export const ViewCompilerOutput = (fileWrapper: FileWrapper) => ({
	icon: 'mdi-cogs',
	name: 'windows.packExplorer.fileActions.viewCompilerOutput.name',
	description:
		'windows.packExplorer.fileActions.viewCompilerOutput.description',
	onTrigger: async () => {
		const app = await App.getApp()
		const project = app.project
		if (!fileWrapper.path) return

		const transformedPath = await project.compilerService.getCompilerOutputPath(
			fileWrapper.path
		)
		const fileSystem = app.comMojang.hasComMojang
			? app.comMojang.fileSystem
			: app.fileSystem

		// Information when file does not exist
		if (
			!transformedPath ||
			!(await fileSystem.fileExists(transformedPath))
		) {
			new InformationWindow({
				description:
					'windows.packExplorer.fileActions.viewCompilerOutput.fileMissing',
			})
			return
		}

		const fileHandle = await fileSystem.getFileHandle(transformedPath)
		await project?.openFile(fileHandle, {
			selectTab: true,
			readOnlyMode: 'forced',
		})
	},
})

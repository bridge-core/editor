import { App } from '/@/App'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export const ViewCompilerOutput = (
	filePath?: string | null,
	addKeyBinding = false
) => ({
	icon: 'mdi-cogs',
	name: 'windows.packExplorer.fileActions.viewCompilerOutput.name',
	description:
		'windows.packExplorer.fileActions.viewCompilerOutput.description',
	keyBinding: addKeyBinding ? 'Ctrl + Shift + D' : undefined,

	onTrigger: async () => {
		const app = await App.getApp()
		const project = app.project

		if (filePath === undefined) {
			const currentTab = app.project.tabSystem?.selectedTab
			if (!(currentTab instanceof FileTab)) return

			filePath = currentTab.getPath()
		}
		if (!filePath) return

		const transformedPath = await project.compilerService.getCompilerOutputPath(
			filePath
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

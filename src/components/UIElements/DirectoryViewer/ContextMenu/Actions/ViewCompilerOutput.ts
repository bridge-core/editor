import { App } from '/@/App'
import { IActionConfig } from '/@/components/Actions/SimpleAction'
import { FileTab } from '/@/components/TabSystem/FileTab'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export const ViewCompilerOutput = (
	filePath?: string | null,
	addKeyBinding = false,
	addViewBeforeName = true
) =>
	<IActionConfig>{
		icon: 'mdi-file-cog-outline',
		name: `actions.viewCompilerOutput.${
			addViewBeforeName ? 'view' : 'name'
		}`,
		keyBinding: addKeyBinding ? 'Ctrl + Shift + D' : undefined,

		onTrigger: async () => {
			const app = await App.getApp()
			const project = app.project

			let fileToView = filePath
			if (fileToView === undefined) {
				const currentTab = app.project.tabSystem?.selectedTab
				if (!(currentTab instanceof FileTab)) return

				fileToView = currentTab.getPath()
			}
			if (!fileToView) return

			const transformedPath = await project.compilerService.getCompilerOutputPath(
				fileToView
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
					description: 'actions.viewCompilerOutput.fileMissing',
				})
				return
			}

			const fileHandle = await fileSystem.getFileHandle(transformedPath)
			await project?.openFile(fileHandle, {
				selectTab: true,
				readOnlyMode: 'forced',
			})
		},
	}

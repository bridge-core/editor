import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { App } from '/@/App'
import { SimpleAction } from '../../Actions/SimpleAction'

export const restartWatchModeConfig = {
	icon: 'mdi-restart-alert',
	name: 'windows.packExplorer.restartWatchMode.name',
	description: 'windows.packExplorer.restartWatchMode.description',
	onTrigger: () => {
		new ConfirmationWindow({
			description:
				'windows.packExplorer.restartWatchMode.confirmDescription',
			height: 168,
			onConfirm: async () => {
				const app = await App.getApp()

				await Promise.all([
					app.project.fileSystem.unlink('.bridge/.lightningCache'),
					app.project.fileSystem.unlink('.bridge/.compilerFiles'),
				])
				await app.project.fileSystem.writeFile(
					'.bridge/.restartWatchMode',
					''
				)

				app.actionManager.trigger('bridge.action.refreshProject')
			},
		})
	},
}

export const restartWatchModeAction = new SimpleAction(restartWatchModeConfig)

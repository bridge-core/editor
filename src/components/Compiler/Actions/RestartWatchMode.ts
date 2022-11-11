import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { App } from '/@/App'
import { SimpleAction } from '../../Actions/SimpleAction'

export const restartWatchModeConfig = (includeDescription = true) => ({
	icon: 'mdi-restart-alert',
	name: 'packExplorer.restartWatchMode.name',
	description: includeDescription
		? 'packExplorer.restartWatchMode.description'
		: undefined,
	onTrigger: () => {
		new ConfirmationWindow({
			description: 'packExplorer.restartWatchMode.confirmDescription',
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
})

export const restartWatchModeAction = new SimpleAction(restartWatchModeConfig())

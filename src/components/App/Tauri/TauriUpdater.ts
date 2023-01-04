import { createNotification } from '../../Notifications/create'
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
import { App } from '/@/App'
import { openUpdateWindow } from '../../Windows/Update/UpdateWindow'

async function installTauriUpdate() {
	const app = await App.getApp()

	// Task to indicate background progress
	const task = app.taskManager.create({
		icon: 'mdi-update',
		name: 'sidebar.notifications.installingUpdate.name',
		description: 'sidebar.notifications.installingUpdate.description',

		indeterminate: true,
	})

	// Install the update
	await installUpdate()
	// Dispose task
	task.complete()

	// Create a notification to indicate that the app needs to be restarted
	createNotification({
		icon: 'mdi-update',
		color: 'primary',
		message: 'sidebar.notifications.restartToApplyUpdate.message',
		textColor: 'white',
		onClick: async () => {
			// ...and finally relaunch the app
			await relaunch()
		},
	})
}

checkUpdate()
	.then(async (update) => {
		console.log(update.manifest)

		if (!update.shouldUpdate) return

		const notification = createNotification({
			icon: 'mdi-update',
			color: 'primary',
			message: 'sidebar.notifications.updateAvailable.message',
			textColor: 'white',
			onClick: async () => {
				// Dispose the notification
				notification.dispose()

				// Install the update
				await installTauriUpdate()
			},
		})

		openUpdateWindow({
			// Version should always be defined because we're checking update.shouldUpdate before
			version: update.manifest?.version ?? '2.x',
			onClick: () => {
				// Dispose the notification
				notification.dispose()

				// Install the update
				installTauriUpdate()
			},
		})
	})
	.catch((err: any) => {
		console.error(`[TauriUpdater] ${err}`)

		return null
	})

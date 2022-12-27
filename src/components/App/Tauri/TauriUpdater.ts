import { createNotification } from '../../Notifications/create'
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
import { App } from '/@/App'

checkUpdate()
	.then(async (update) => {
		const app = await App.getApp()

		if (update.shouldUpdate) {
			const notification = createNotification({
				icon: 'mdi-update',
				color: 'primary',
				message: 'sidebar.notifications.updateAvailable.message',
				textColor: 'white',
				onClick: async () => {
					// Dispose the notification
					notification.dispose()

					// Task to indicate background progress
					const task = app.taskManager.create({
						icon: 'mdi-update',
						name: 'sidebar.notifications.installingUpdate.name',
						description:
							'sidebar.notifications.installingUpdate.description',

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
						message:
							'sidebar.notifications.restartToApplyUpdate.message',
						textColor: 'white',
						onClick: async () => {
							// ...and finally relaunch the app
							await relaunch()
						},
					})
				},
			})
		}
	})
	.catch((err: any) => {
		console.error(`[TauriUpdater] ${err}`)

		return null
	})

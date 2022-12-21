import { createNotification } from '../../Notifications/create'
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'

checkUpdate()
	.then((update) => {
		if (update.shouldUpdate) {
			const notification = createNotification({
				icon: 'mdi-update',
				color: 'primary',
				message: 'sidebar.notifications.updateAvailable.message',
				textColor: 'white',
				onClick: async () => {
					// Dispose the notification
					notification.dispose()
					// Install the update
					await installUpdate()
					// ...and finally relaunch the app
					await relaunch()
				},
			})
		}
	})
	.catch((err: any) => {
		console.error(`[TauriUpdater] ${err}`)
		return null
	})

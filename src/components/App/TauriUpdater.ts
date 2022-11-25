import { createNotification } from '../Notifications/create'
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'

checkUpdate()
	.then((update) => {
		if (update.shouldUpdate) {
			createNotification({
				icon: 'mdi-update',
				color: 'primary',
				message: 'sidebar.notifications.updateAvailable.message',
				textColor: 'white',
				onClick: async () => {
					await installUpdate()
				},
			})
		}
	})
	.catch((err: any) => {
		console.error(`Failed to check for update: ${err}`)
		return null
	})

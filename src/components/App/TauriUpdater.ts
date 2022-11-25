import { createNotification } from '../Notifications/create'
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'

const update = await checkUpdate().catch((err: any) => {
	console.error(`Failed to check for update: ${err}`)
	return null
})

if (update?.shouldUpdate) {
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

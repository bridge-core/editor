import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { emit } from '@tauri-apps/api/event'

async function installTauriUpdate() {
	// Task to indicate background progress
	// TODO: Make tasks with undetermined time
	const task = NotificationSystem.addProgressNotification('upgrade', 0, 100, undefined)

	// Install the update
	await installUpdate()

	// Dispose task
	NotificationSystem.clearNotification(task)

	// Create a notification to indicate that the app needs to be restarted
	NotificationSystem.addNotification('upgrade', async () => {
		// ...and finally relaunch the app
		await relaunch()
	})
}

checkUpdate()
	.then(async (update) => {
		console.log(update)

		if (!update.shouldUpdate) return

		const notification = NotificationSystem.addNotification('upgrade', async () => {
			// Install the update
			await installTauriUpdate()
		})

		// openUpdateWindow({
		// 	// Version should always be defined because we're checking update.shouldUpdate before
		// 	version: update.manifest?.version ?? '2.x',
		// 	onClick: () => {
		// 		// Dispose the notification
		// 		notification.dispose()

		// 		// Install the update
		// 		installTauriUpdate()
		// 	},
		// })

		installTauriUpdate()
	})
	.catch((err: any) => {
		console.error(`[TauriUpdater] ${err}`)

		return null
	})

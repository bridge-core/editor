import { checkUpdate, installUpdate } from '@tauri-apps/api/updater'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'

async function installTauriUpdate() {
	// Task to indicate background progress
	// TODO: Make tasks with undetermined time
	NotificationSystem.addProgressNotification('upgrade', 0, 100, undefined)

	// Install the update. This relaunches the application
	await installUpdate()
}

checkUpdate()
	.then(async (update) => {
		if (!update.shouldUpdate) return

		NotificationSystem.addNotification('upgrade', async () => {
			await installTauriUpdate()
		})
	})
	.catch((err: any) => {
		console.error(`[TauriUpdater] ${err}`)

		return null
	})

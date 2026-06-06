import { check, type Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'

async function installTauriUpdate(update: Update) {
    // Task to indicate background progress
	// TODO: Make tasks with undetermined time
	NotificationSystem.addProgressNotification('upgrade', 0, 100, undefined)

	await update.downloadAndInstall()
	await relaunch()
}

check()
	.then(async (update) => {
		if (!update) return

		NotificationSystem.addNotification('upgrade', async () => {
			await installTauriUpdate(update)
		})
	})
	.catch((err: any) => {
		console.error(`[TauriUpdater] ${err}`)
	})

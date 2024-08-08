import { registerSW } from 'virtual:pwa-register'
import { set } from 'idb-keyval'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'

const updateSW = registerSW({
	async onNeedRefresh() {
		console.log('New content is available; please refresh.')

		await set('firstStartAfterUpdate', true)

		NotificationSystem.addNotification('mdi-update', () => updateSW())
	},
	onOfflineReady() {
		// bridge. is ready to work offline
		console.log('bridge. is ready to work offline')
	},
})

/* eslint-disable no-console */

import { registerSW } from 'virtual:pwa-register'
import { createNotification } from '/@/components/Notifications/create'
import { App } from '/@/App'
import { set } from 'idb-keyval'

const updateSW = registerSW({
	async onNeedRefresh() {
		console.log('New content is available; please refresh.')

		await set('firstStartAfterUpdate', true)

		createNotification({
			icon: 'mdi-update',
			color: 'primary',
			message: 'sidebar.notifications.updateAvailable.message',
			textColor: 'white',
			onClick: () => updateSW(),
		})
	},
	onOfflineReady() {
		// bridge. is ready to work offline
		console.log('bridge. is ready to work offline')
	},
})

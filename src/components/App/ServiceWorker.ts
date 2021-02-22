/* eslint-disable no-console */

import { register } from 'register-service-worker'
import { createNotification } from '/@/components/Notifications/create'
import { App } from '/@/App'
import { set } from 'idb-keyval'

if (process.env.mode === 'development') {
	register(`${process.env.BASE_URL}service-worker.js`, {
		ready() {
			console.log(
				'App is being served from cache by a service worker.\n' +
					'For more details, visit https://goo.gl/AFskqB'
			)
		},
		registered() {
			console.log('Service worker has been registered.')
		},
		cached() {
			console.log('Content has been cached for offline use.')
		},
		updatefound() {
			console.log('New content is downloading.')
		},
		updated(serviceWorker) {
			console.log('New content is available; please refresh.')

			if (App.fileSystemSetup.status === 'waiting') {
				updateApp(serviceWorker)
			} else {
				createNotification({
					icon: 'mdi-update',
					color: 'primary',
					message: 'sidebar.notifications.updateAvailable.message',
					textColor: 'white',
					onClick: () => updateApp(serviceWorker),
				})
			}
		},
		offline() {
			console.log(
				'No internet connection found. App is running in offline mode.'
			)
		},
		error(error) {
			console.error('Error during service worker registration:', error)
		},
	})
}

export function updateApp(serviceWorker: ServiceWorkerRegistration) {
	if (serviceWorker.waiting)
		serviceWorker.waiting.postMessage({
			type: 'SKIP_WAITING',
		})

	navigator.serviceWorker.addEventListener('controllerchange', async () => {
		await set('firstStartAfterUpdate', true)
		window.location.reload()
	})
}

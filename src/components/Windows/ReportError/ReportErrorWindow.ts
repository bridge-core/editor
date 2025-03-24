import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { Window } from '../Window'
import { Windows } from '../Windows'
import Component from './ReportError.vue'

export class ReportErrorWindow extends Window {
	public component = Component

	constructor(public message: string) {
		super()
	}

	public static setup() {
		window.addEventListener('error', (event) => {
			this.openErrorWindow(event.error)
		})

		window.onunhandledrejection = (event) => {
			this.openErrorWindow(event.reason)
		}
	}

	public static openErrorWindow(error: Error) {
		NotificationSystem.addNotification(
			'report',
			() => {
				Windows.open(new ReportErrorWindow(error.message))
			},
			'error'
		)
	}
}

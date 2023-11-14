import { Signal } from '../../libs/event/Signal'
import { Notification } from '../Notifications/Notification'

export class InstallApp extends Notification {
	public readonly isInstallable = new Signal<void>()
	public readonly isInstalled = new Signal<void>()
	protected installEvent!: any

	constructor() {
		super({
			message: 'sidebar.notifications.installApp.message',
			color: 'primary',
			icon: 'mdi-download',
			textColor: 'white',
			isVisible: false,
		})

		window.addEventListener('beforeinstallprompt', (event: any) =>
			this.onInstallPrompt(event)
		)
		window.addEventListener('appinstalled', () => this.dispose())
		this.addClickHandler(() => this.prompt())
	}

	onInstallPrompt(event: any) {
		event.preventDefault()
		this.installEvent = event
		this.show()
		this.isInstallable.dispatch()
	}

	prompt() {
		if (this.installEvent) {
			this.installEvent.prompt()

			this.installEvent.userChoice.then((choice: any) => {
				if (choice.outcome === 'accepted') {
					this.dispose()
					this.isInstalled.dispatch()
				}
			})
		} else {
			this.dispose()
		}
	}
}

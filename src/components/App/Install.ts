import { Notification } from '../Notifications/Notification'

export class InstallApp extends Notification {
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
		this.addClickHandler(() => this.prompt())
	}

	onInstallPrompt(event: any) {
		event.preventDefault()
		this.installEvent = event
		this.show()
	}

	prompt() {
		if (this.installEvent) {
			this.installEvent.prompt()

			this.installEvent.userChoice.then((choice: any) => {
				if (choice.outcome === 'accepted') this.dispose()
			})
		} else {
			this.dispose()
		}
	}
}

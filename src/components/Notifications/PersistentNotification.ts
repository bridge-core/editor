import { createStore, get, set } from 'idb-keyval'
import { INotificationConfig, Notification } from './Notification'

const store = createStore('app-notifications', 'app-notification-store')

export class PersistentNotification extends Notification {
	constructor(config: INotificationConfig) {
		super(config)
		if (!config.id) throw new Error(`PersistentNotification requires an id`)
	}

	async show() {
		if (await get<boolean>(this.id, store)) return

		super.show()
	}
	dispose() {
		super.dispose()

		set(this.id, true, store)
	}
}

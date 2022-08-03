import { watch } from 'vue'
import { Framework } from 'vuetify'
import { EventDispatcher } from '../Common/Event/EventDispatcher'
import { App } from '/@/App'

export class Mobile {
	public readonly change = new EventDispatcher<boolean>()

	constructor(protected vuetify: Framework) {
		watch(vuetify.breakpoint, () => {
			this.change.dispatch(vuetify.breakpoint.mobile)
		})

		App.getApp().then(() => {
			setTimeout(
				() => this.change.dispatch(vuetify.breakpoint.mobile),
				10
			)
		})
	}

	isCurrentDevice() {
		return this.vuetify.breakpoint.mobile
	}
}

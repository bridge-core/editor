import { watch } from 'vue'
import { VuetifyOptions } from 'vuetify'
import { EventDispatcher } from '../Common/Event/EventDispatcher'

export class Mobile {
	public readonly change = new EventDispatcher<boolean>()

	constructor(protected vuetify: any) {
		watch(vuetify.display, () => {
			this.change.dispatch(vuetify.display.mobile)
		})

		this.change.dispatch(vuetify.display.mobile)
	}

	isCurrentDevice() {
		return this.vuetify.display.mobile
	}
}

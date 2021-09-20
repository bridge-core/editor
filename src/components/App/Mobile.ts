import { watch } from '@vue/composition-api'
import { Framework } from 'vuetify'
import { EventDispatcher } from '../Common/Event/EventDispatcher'

export class Mobile {
	public readonly change = new EventDispatcher<boolean>()

	constructor(protected vuetify: Framework) {
		watch(vuetify.breakpoint, () => {
			this.change.dispatch(vuetify.breakpoint.mobile)
		})

		this.change.dispatch(vuetify.breakpoint.mobile)
	}

	isCurrentDevice() {
		return this.vuetify.breakpoint.mobile
	}
}

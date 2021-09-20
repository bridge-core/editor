import { ref, shallowReactive, watch } from '@vue/composition-api'

export class WindowState {
	public state = shallowReactive<Record<string, any>>({})
	public isAnyWindowVisible = ref(true)

	constructor() {
		watch(
			this.state,
			() => {
				for (const window of Object.values(this.state)) {
					if (window.isVisible) {
						this.isAnyWindowVisible.value = true
						return
					}
				}

				this.isAnyWindowVisible.value = false
			},
			{ deep: false }
		)
	}
}

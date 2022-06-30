import { ref, shallowReactive, watch } from 'vue'

export class WindowState {
	public state = shallowReactive<Record<string, any>>({})
	public isAnyWindowVisible = ref(false)

	constructor() {
		watch(
			this.state,
			() => {
				for (const window of Object.values(this.state)) {
					if (window.isVisible) {
						this.isAnyWindowVisible.value = true
						console.log('CHANGE', window, this.isAnyWindowVisible)
						return
					}
				}

				this.isAnyWindowVisible.value = false
				console.log('CHANGE', this.isAnyWindowVisible)
			},
			{ deep: false }
		)
	}
}

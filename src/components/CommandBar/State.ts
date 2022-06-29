import { reactive } from '@vue/composition-api'

export const CommandBarState = reactive({
	isWindowOpen: false,
	shouldRender: false, // Property is automatically updated
	closeDelay: null,
})

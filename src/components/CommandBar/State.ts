import { reactive } from 'vue'

export const CommandBarState = reactive({
	isWindowOpen: false,
	shouldRender: false, // Property is automatically updated
	closeDelay: null,
})

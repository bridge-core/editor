import { reactive } from 'vue'
import { SimpleAction } from '../Actions/SimpleAction'

export const CommandBarState = reactive({
	isWindowOpen: false,
	shouldRender: false, // Property is automatically updated
	closeDelay: null,
})
const CommandBarActions = new Set<SimpleAction>()
export function addCommandBarAction(action: SimpleAction) {
	CommandBarActions.add(action)

	return {
		dispose: () => {
			CommandBarActions.delete(action)
		},
	}
}
export function getCommandBarActions() {
	return Array.from(CommandBarActions)
}

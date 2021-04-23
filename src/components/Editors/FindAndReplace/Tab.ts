import FindAndReplaceComponent from './Tab.vue'
import { Tab } from '../../TabSystem/CommonTab'

export class FindAndReplaceTab extends Tab {
	component = FindAndReplaceComponent

	static is() {
		return false
	}
	async isFor() {
		return false
	}

	async onActivate() {}

	get icon() {
		return 'mdi-file-search-outline'
	}
	get iconColor() {
		return 'success'
	}
	get name() {
		return 'Find & Replace'
	}

	save() {}
}

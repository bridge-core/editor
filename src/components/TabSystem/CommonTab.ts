import type Vue from 'vue'
import { DirectoryEntry } from '@/components/Sidebar/Content/Explorer/DirectoryEntry'
import { v4 as uuid } from 'uuid'
import type { TabSystem } from './Main'


export abstract class Tab {
	abstract component: Vue.Component
	isUnsaved = false
	uuid = uuid()

	constructor(
		protected parent: TabSystem,
		protected directoryEntry: DirectoryEntry
	) {}

	get name() {
		return this.directoryEntry.name
	}

	get isSelected() {
		return this.parent.selectedTab === this
	}
	select() {
		this.parent.select(this)
		return this
	}
	close() {
		this.parent.close(this)
	}
	isFor(directoryEntry: DirectoryEntry) {
		return directoryEntry === this.directoryEntry
	}

	onActivate() {}
	onDeactivate() {}
	onDestroy() {}

	abstract save(): void
}

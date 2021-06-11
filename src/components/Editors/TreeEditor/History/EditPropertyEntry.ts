import { ObjectTree } from '../Tree/ObjectTree'
import { Tree } from '../Tree/Tree'
import { HistoryEntry } from './HistoryEntry'

export class EditPropertyEntry extends HistoryEntry {
	unselectTrees: Tree<unknown>[]

	constructor(
		protected parent: ObjectTree,
		protected oldValue: string,
		protected newValue: string
	) {
		super()
		this.unselectTrees = [parent]
	}

	undo() {
		this.parent.updatePropertyName(this.newValue, this.oldValue)

		return new EditPropertyEntry(this.parent, this.newValue, this.oldValue)
	}
}

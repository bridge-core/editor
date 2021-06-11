import { ObjectTree } from '../Tree/ObjectTree'
import { Tree } from '../Tree/Tree'
import { HistoryEntry } from './HistoryEntry'

export class EditEntry extends HistoryEntry {
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

		return new EditEntry(this.parent, this.newValue, this.oldValue)
	}
}

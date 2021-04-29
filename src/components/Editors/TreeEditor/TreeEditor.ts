import { ITreeEditorState } from './Tab'
import { createTree } from './Tree/createTree'
import { Tree } from './Tree/Tree'

export class TreeEditor {
	protected tree: Tree<unknown>

	constructor(protected state: ITreeEditorState, protected json: unknown) {
		this.tree = createTree(null, json)
	}

	toJSON() {
		return this.tree.toJSON()
	}
}

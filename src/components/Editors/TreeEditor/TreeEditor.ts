import { ActionManager } from '../../Actions/ActionManager'
import { KeyBindingManager } from '../../Actions/KeyBindingManager'
import { UndoDeleteEntry } from './History/DeleteEntry'
import { EditorHistory } from './History/EditorHistory'
import { ArrayTree } from './Tree/ArrayTree'
import { createTree } from './Tree/createTree'
import { ObjectTree } from './Tree/ObjectTree'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import { Tree } from './Tree/Tree'
import { TreeSelection, TreeValueSelection } from './TreeSelection'

export class TreeEditor {
	protected tree: Tree<unknown>
	protected selections: (TreeSelection | TreeValueSelection)[] = []
	protected _keyBindings: KeyBindingManager | undefined
	protected _actions: ActionManager | undefined
	protected history = new EditorHistory()

	get keyBindings() {
		if (!this._keyBindings)
			throw new Error(
				`Cannot access keyBindings before they were initialized.`
			)

		return this._keyBindings
	}
	get actions() {
		if (!this._actions)
			throw new Error(
				`Cannot access keyBindings before they were initialized.`
			)

		return this._actions
	}

	constructor(protected json: unknown) {
		this.tree = createTree(null, json)
		this.setSelection(this.tree)
	}

	receiveContainer(container: HTMLDivElement) {
		this._keyBindings = new KeyBindingManager(container)
		this._actions = new ActionManager(this._keyBindings)

		this.actions.create({
			keyBinding: ['DELETE', 'BACKSPACE'],
			onTrigger: () => {
				this.forEachSelection((sel) => {
					const tree = sel.getTree()
					if (!tree.getParent()) return // May not delete global tree

					this.setSelection(tree.getParent()!)

					const [index, key] = tree.delete()
					sel.dispose()

					this.history.push(new UndoDeleteEntry(tree, index, key))
				})
			},
		})

		this.actions.create({
			keyBinding: ['ESCAPE'],
			onTrigger: () => {
				this.setSelection(this.tree)
			},
		})

		this.actions.create({
			keyBinding: ['CTRL + Z'],
			onTrigger: () => {
				this.history.undo()
			},
		})

		this.actions.create({
			keyBinding: ['CTRL + Y'],
			onTrigger: () => {
				this.history.redo()
			},
		})
	}

	toJSON() {
		return this.tree.toJSON()
	}

	forEachSelection(
		cb: (selection: TreeSelection | TreeValueSelection) => void
	) {
		this.selections.forEach(cb)
	}

	removeSelection(selection: TreeSelection | TreeValueSelection) {
		this.selections = this.selections.filter((sel) => selection !== sel)
	}

	setSelection(tree: Tree<unknown>, selectPrimitiveValue = false) {
		this.selections.forEach((selection) => selection.dispose(false))
		this.selections = [
			selectPrimitiveValue && tree instanceof PrimitiveTree
				? new TreeValueSelection(this, tree)
				: new TreeSelection(this, <ArrayTree | ObjectTree>tree),
		]
	}
	toggleSelection(tree: Tree<unknown>, selectPrimitiveValue = false) {
		let didRemoveSelection = false
		this.selections = this.selections.filter((selection) => {
			if (
				selection.getTree() !== tree ||
				selection instanceof TreeValueSelection !== selectPrimitiveValue
			)
				return true

			selection.dispose(false)
			didRemoveSelection = true
			return false
		})

		if (!didRemoveSelection)
			this.selections.push(
				selectPrimitiveValue && tree instanceof PrimitiveTree
					? new TreeValueSelection(this, tree)
					: new TreeSelection(this, <ArrayTree | ObjectTree>tree)
			)
	}
}

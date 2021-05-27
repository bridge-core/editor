import { ActionManager } from '../../Actions/ActionManager'
import { KeyBindingManager } from '../../Actions/KeyBindingManager'
import { UndoDeleteEntry } from './History/DeleteEntry'
import { EditorHistory } from './History/EditorHistory'
import { HistoryEntry } from './History/HistoryEntry'
import { ReplaceTreeEntry } from './History/ReplaceTree'
import { TreeTab } from './Tab'
import { ArrayTree } from './Tree/ArrayTree'
import { createTree } from './Tree/createTree'
import { ObjectTree } from './Tree/ObjectTree'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import type { TPrimitiveTree, Tree } from './Tree/Tree'
import { TreeSelection, TreeValueSelection } from './TreeSelection'

export class TreeEditor {
	protected tree: Tree<unknown>
	protected selections: (TreeSelection | TreeValueSelection)[] = []
	protected _keyBindings: KeyBindingManager | undefined
	protected _actions: ActionManager | undefined
	protected history = new EditorHistory(this)

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

	constructor(protected parent: TreeTab, protected json: unknown) {
		this.tree = createTree(null, json)
		this.setSelection(this.tree)

		this.history.on((isUnsaved) => this.parent.setIsUnsaved(isUnsaved))
	}

	receiveContainer(container: HTMLDivElement) {
		this._keyBindings = new KeyBindingManager(container)
		this._actions = new ActionManager(this._keyBindings)

		this.actions.create({
			keyBinding: ['DELETE', 'BACKSPACE'],
			onTrigger: () => {
				const entries: HistoryEntry[] = []

				this.forEachSelection((sel) => {
					const tree = sel.getTree()
					if (!tree.getParent()) return // May not delete global tree

					if (
						sel instanceof TreeValueSelection &&
						tree.getParent()!.type === 'object'
					) {
						// A delete action on a primitive value replaces the PrimitiveTree with an emtpy ObjectTree
						const newTree = new ObjectTree(tree.getParent(), {})
						this.toggleSelection(newTree)

						tree.replace(newTree)

						entries.push(new ReplaceTreeEntry(tree, newTree))
					} else {
						this.toggleSelection(tree.getParent()!)

						const [index, key] = tree.delete()

						entries.push(new UndoDeleteEntry(tree, index, key))
					}

					sel.dispose()
				})

				this.history.pushAll(entries)
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

	saveState() {
		this.history.saveState()
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
	removeSelectionOf(tree: Tree<unknown>) {
		this.selections = this.selections.filter((sel) => {
			if (sel.getTree() !== tree) return true

			sel.dispose(false)
			return false
		})
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

	addKey(value: string) {
		const entries: HistoryEntry[] = []

		this.forEachSelection((selection) => {
			if (selection instanceof TreeValueSelection) return

			entries.push(selection.addKey(value))
		})

		this.history.pushAll(entries)
	}

	addValue(value: string) {
		let transformedValue: TPrimitiveTree = value
		if (!Number.isNaN(Number(value))) transformedValue = Number(value)
		else if (value === 'null') transformedValue = null
		else if (value === 'true' || value === 'false')
			transformedValue = value === 'true'

		const entries: HistoryEntry[] = []
		console.log(value, this.selections)
		this.forEachSelection((selection) => {
			if (selection instanceof TreeValueSelection) return

			const entry = selection.addValue(transformedValue)
			if (entry) entries.push(entry)
		})

		this.history.pushAll(entries)
	}
}

import { ActionManager } from '/@/components/Actions/ActionManager'
import { KeyBindingManager } from '/@/components/Actions/KeyBindingManager'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { FileType } from '/@/components/Data/FileType'
import { SchemaManager } from '/@/components/JSONSchema/Manager'
import { RootSchema } from '/@/components/JSONSchema/Schema/Root'
import { ICompletionItem } from '/@/components/JSONSchema/Schema/Schema'
import { DeleteEntry, UndoDeleteEntry } from './History/DeleteEntry'
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
import { App } from '/@/App'
import { debounce } from 'lodash-es'
import { showContextMenu } from '/@/components/ContextMenu/showContextMenu'
import { IActionConfig } from '../../Actions/SimpleAction'
import { viewDocumentation } from '../../Documentation/view'

export class TreeEditor {
	public propertySuggestions: ICompletionItem[] = []
	public valueSuggestions: ICompletionItem[] = []

	protected tree: Tree<unknown>
	protected selections: (TreeSelection | TreeValueSelection)[] = []
	protected _keyBindings: KeyBindingManager | undefined
	protected _actions: ActionManager | undefined
	protected history = new EditorHistory(this)
	protected schemaRoot?: RootSchema
	protected selectionChange = new EventDispatcher<void>()
	protected containerElement?: HTMLDivElement
	protected scrollTop = 0

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

		this.history.on((isUnsaved) => {
			this.parent.setIsUnsaved(isUnsaved)
		})
		this.history.changed.on(() => {
			this.propertySuggestions = []
			this.valueSuggestions = []

			this.parent.updateCache()
		})

		App.getApp().then(async (app) => {
			await app.projectManager.projectReady.fired

			this.parent.once(() => {
				if (app.project.jsonDefaults.isReady) this.createSchemaRoot()
			})

			app.project.jsonDefaults.on(() => {
				if (this.parent.hasFired) this.createSchemaRoot()
			})
		})

		this.selectionChange.on(() => this.updateSuggestions())
	}

	updateSuggestions = debounce(() => {
		this.propertySuggestions = []
		this.valueSuggestions = []

		const tree = <ArrayTree | ObjectTree | undefined>this.selections
			.find((sel) => {
				const type = sel.getTree().type
				return type === 'object' || type === 'array'
			})
			?.getTree()
		const json = tree?.toJSON()

		let suggestions: ICompletionItem[] = []
		if (this.selections.length === 0 || tree === this.tree) {
			suggestions = this.schemaRoot?.getCompletionItems(json) ?? []
		} else if (tree) {
			const treePath = tree.path
			const schemas =
				this.schemaRoot?.getSchemasFor(this.tree.toJSON(), treePath) ??
				[]

			if (schemas)
				suggestions = schemas
					.filter((schema) => schema !== undefined)
					.map((schema) => schema.getCompletionItems(json))
					.flat()
		}

		this.propertySuggestions = suggestions
			.filter(
				(suggestion) =>
					(suggestion.type === 'object' ||
						suggestion.type === 'array') &&
					!(<any>(tree ?? this.tree)).children.find((test: any) => {
						if (test.type === 'array') return false
						return test[0] === suggestion.value
					})
			)
			.concat(
				this.parent.app.project.snippetLoader
					.getSnippetsFor(
						this.parent.getFileType(),
						this.selections.map((sel) => sel.getLocation())
					)
					.map(
						(snippet) =>
							<const>{
								type: 'snippet',
								label: snippet.displayData.name,
								value: snippet.insertData,
							}
					)
			)

		// Only suggest values for empty objects or arrays
		if ((tree?.children?.length ?? 1) === 0 || tree?.type === 'array') {
			this.valueSuggestions = suggestions.filter(
				(suggestion) =>
					suggestion.type === 'value' ||
					suggestion.type === 'valueArray'
			)
		}
	}, 50)

	createSchemaRoot() {
		const schemaUri = FileType.get(this.parent.getProjectPath())?.schema
		if (schemaUri)
			this.schemaRoot = SchemaManager.addRootSchema(
				schemaUri,
				new RootSchema(
					schemaUri,
					'$global',
					SchemaManager.request(schemaUri)
				)
			)
		this.updateSuggestions()
	}

	receiveContainer(container: HTMLDivElement) {
		this._keyBindings?.dispose()
		this._actions?.dispose()
		this._keyBindings = new KeyBindingManager(container)
		this._actions = new ActionManager(this._keyBindings)
		this.containerElement = container

		this.actions.create({
			keyBinding: ['Ctrl + DELETE', 'Ctrl + BACKSPACE'],
			onTrigger: () => {
				const entries: HistoryEntry[] = []

				this.forEachSelection((sel) => {
					const tree = sel.getTree()
					if (!tree.getParent()) return // May not delete global tree

					sel.dispose()

					if (
						sel instanceof TreeValueSelection &&
						tree.getParent()!.type === 'object'
					) {
						// A delete action on a primitive value replaces the PrimitiveTree with an emtpy ObjectTree
						const newTree = new ObjectTree(tree.getParent(), {})
						this.setSelection(newTree)

						tree.replace(newTree)

						entries.push(new ReplaceTreeEntry(tree, newTree))
					} else {
						this.toggleSelection(tree.getParent()!)

						const [index, key] = tree.delete()

						entries.push(new UndoDeleteEntry(tree, index, key))
					}
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
	deactivate() {
		this._keyBindings?.dispose()
		this._actions?.dispose()
	}
	activate() {
		if (!this.containerElement) return
		this.receiveContainer(this.containerElement)

		this.containerElement.children[0].scrollTop = this.scrollTop
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
		this.selectionChange.dispatch()
	}
	removeSelectionOf(tree: Tree<unknown>) {
		this.selections = this.selections.filter((sel) => {
			const currTree = sel.getTree()
			if (
				currTree !== tree &&
				(tree instanceof PrimitiveTree ||
					!(<ObjectTree | ArrayTree>tree).hasChild(currTree))
			)
				return true

			sel.dispose(false)
			return false
		})
		this.selectionChange.dispatch()
	}

	setSelection(tree: Tree<unknown>, selectPrimitiveValue = false) {
		this.selections.forEach((selection) => selection.dispose(false))
		this.selections = [
			selectPrimitiveValue && tree instanceof PrimitiveTree
				? new TreeValueSelection(this, tree)
				: new TreeSelection(this, <ArrayTree | ObjectTree>tree),
		]
		this.selectionChange.dispatch()
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
		this.selectionChange.dispatch()
	}

	addKey(value: string, type: 'array' | 'object') {
		const entries: HistoryEntry[] = []

		this.forEachSelection((selection) => {
			if (selection instanceof TreeValueSelection) return

			entries.push(selection.addKey(value, type))
		})

		this.history.pushAll(entries)
	}

	addValue(value: string, type: 'value' | 'valueArray') {
		let transformedValue: TPrimitiveTree = value
		if (!Number.isNaN(Number(value))) transformedValue = Number(value)
		else if (value === 'null') transformedValue = null
		else if (value === 'true' || value === 'false')
			transformedValue = value === 'true'

		const entries: HistoryEntry[] = []

		this.forEachSelection((selection) => {
			if (selection instanceof TreeValueSelection) return

			const entry = selection.addValue(transformedValue, type)
			if (entry) entries.push(entry)
		})

		this.history.pushAll(entries)
	}
	addFromJSON(json: any) {
		if (typeof json !== 'object') return

		let entries: HistoryEntry[] = []

		this.forEachSelection((sel) => {
			if (sel instanceof TreeValueSelection) return
			const parentTree = sel.getTree()
			const index = parentTree.children.length

			for (const key in json) {
				const newTree = createTree(parentTree, json[key])
				if (parentTree instanceof ObjectTree)
					parentTree.addChild(key, newTree)
				else parentTree.addChild(newTree)

				entries.push(
					new DeleteEntry(
						newTree,
						index,
						parentTree instanceof ObjectTree ? key : undefined
					)
				)
			}
		})

		this.history.pushAll(entries)
	}

	edit(value: string) {
		const historyEntries: HistoryEntry[] = []

		this.forEachSelection((selection) => {
			const entry = selection.edit(value)
			if (entry) historyEntries.push(entry)
		})

		this.history.pushAll(historyEntries)
	}

	delete(tree: Tree<unknown>) {
		this.removeSelectionOf(tree)

		const [index, key] = tree.delete()

		this.history.push(new UndoDeleteEntry(tree, index, key))
	}
	/**
	 * This delete action on a primitive value replaces the PrimitiveTree with an emtpy ObjectTree
	 * @param tree
	 */
	objectValueDeletion(tree: PrimitiveTree) {
		this.removeSelectionOf(tree)
		const newTree = new ObjectTree(tree.getParent(), {})

		tree.replace(newTree)

		this.history.push(new ReplaceTreeEntry(tree, newTree))
	}

	onPasteMenu(event?: MouseEvent, tree = this.tree) {
		const pasteMenu = [
			{
				name: 'actions.paste.name',
				icon: 'mdi-content-paste',
				onTrigger: () => {
					this.setSelection(tree)
					this.parent.paste()
				},
			},
		]

		if (event && !this.parent.isReadOnly) showContextMenu(event, pasteMenu)

		return pasteMenu
	}

	onReadOnlyMenu(event?: MouseEvent, tree = this.tree, selectedKey = true) {
		const readOnlyMenu = [
			{
				name: 'actions.documentationLookup.name',
				icon: 'mdi-book-open-outline',
				onTrigger: () => {
					const word = selectedKey ? tree.key : tree.value

					if (typeof word === 'string')
						viewDocumentation(this.parent.getProjectPath(), word)
				},
			},
			{
				name: 'actions.copy.name',
				icon: 'mdi-content-copy',
				onTrigger: () => {
					this.setSelection(tree, !selectedKey)
					this.parent.copy()
				},
			},
		]

		if (event) showContextMenu(event, readOnlyMenu)

		return readOnlyMenu
	}

	onContextMenu(
		event: MouseEvent,
		tree: PrimitiveTree | ArrayTree | ObjectTree,
		selectedKey = true
	) {
		if (this.parent.isReadOnly)
			return this.onReadOnlyMenu(event, tree, selectedKey)
		const [viewDocs, copy] = this.onReadOnlyMenu(
			undefined,
			tree,
			selectedKey
		)

		const contextMenu: (IActionConfig | null)[] = [viewDocs]
		// Delete node
		if (tree instanceof PrimitiveTree)
			contextMenu.push({
				name: 'general.delete',
				icon: 'mdi-delete-outline',
				onTrigger: () => {
					if (tree.getParent()!.type === 'object' && !selectedKey)
						this.objectValueDeletion(tree)
					else this.delete(tree)
				},
			})
		else
			contextMenu.push({
				name: 'general.delete',
				icon: 'mdi-delete-outline',
				onTrigger: () => {
					this.delete(tree)
				},
			})

		// Copy, cut & paste
		contextMenu.push(
			copy,
			{
				name: 'actions.cut.name',
				icon: 'mdi-content-cut',
				onTrigger: () => {
					this.setSelection(tree, !selectedKey)
					this.parent.cut()
				},
			},
			...(tree instanceof PrimitiveTree
				? []
				: this.onPasteMenu(undefined, tree))
		)

		// Object -> array and vice versa
		if (!(tree instanceof PrimitiveTree) && tree.children.length === 0) {
			contextMenu.push({
				name:
					tree instanceof ArrayTree
						? 'actions.toObject.name'
						: 'actions.toArray.name',
				icon:
					tree instanceof ArrayTree
						? 'mdi-code-braces-box'
						: 'mdi-code-array',
				onTrigger: () => {
					this.removeSelectionOf(tree)

					if (tree instanceof ArrayTree) {
						const newTree = new ObjectTree(tree.getParent(), {})
						tree.replace(newTree)
						this.history.push(new ReplaceTreeEntry(tree, newTree))
					} else {
						const newTree = new ArrayTree(tree.getParent(), [])
						tree.replace(newTree)
						this.history.push(new ReplaceTreeEntry(tree, newTree))
					}
				},
			})
		}

		showContextMenu(event, contextMenu)
	}
}

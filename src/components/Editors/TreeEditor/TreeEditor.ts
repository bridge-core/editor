import { ActionManager } from '/@/components/Actions/ActionManager'
import { KeyBindingManager } from '/@/components/Actions/KeyBindingManager'
import { EventDispatcher } from '/@/components/Common/Event/EventDispatcher'
import { SchemaManager } from '/@/components/JSONSchema/Manager'
import { RootSchema } from '/@/components/JSONSchema/Schema/Root'
import {
	ICompletionItem,
	pathWildCard,
	TSchemaType,
} from '/@/components/JSONSchema/Schema/Schema'
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
import { IActionConfig } from '/@/components/Actions/SimpleAction'
import { viewDocumentation } from '/@/components/Documentation/view'
import { platformRedoBinding } from '/@/utils/constants'
import { getLatestFormatVersion } from '/@/components/Data/FormatVersions'
import { filterDuplicates } from './CompletionItems/FilterDuplicates'
import { inferType } from '/@/utils/inferType'

export class TreeEditor {
	public type = 'treeEditor'
	public propertySuggestions: ICompletionItem[] = []
	public valueSuggestions: ICompletionItem[] = []
	public editSuggestions: ICompletionItem[] = []

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
		const tree = createTree(this, json)
		this.setSelection(tree)
		this.tree = tree

		this.history.on((isUnsaved) => {
			this.parent.setIsUnsaved(isUnsaved)
		})
		this.history.changed.on(() => {
			this.propertySuggestions = []
			this.valueSuggestions = []

			this.parent.updateCache()
			this.parent.fileDidChange()
		})

		App.getApp().then(async (app) => {
			await app.projectManager.projectReady.fired

			this.parent.once(() => {
				if (!app.project.jsonDefaults.isReady) return

				this.createSchemaRoot()
				if (this.parent.isSelected) tree.requestValidation()
			})

			app.project.jsonDefaults.on(() => {
				if (!this.parent.hasFired) return

				this.createSchemaRoot()
				if (this.parent.isSelected) tree.requestValidation()
			})
		})

		this.selectionChange.on(() => this.updateSuggestions())
	}

	updateSuggestions = debounce(async () => {
		const currentFormatVersion: string =
			(<any>this.tree.toJSON()).format_version ||
			this.parent.project.config.get().targetVersion ||
			(await getLatestFormatVersion())

		const { tree, isValueSelection } = this.getSelectedTree()

		const suggestions = this.getSuggestions(tree)
		// console.log(suggestions)

		this.propertySuggestions = filterDuplicates(
			suggestions
				.filter(
					(suggestion) =>
						['object', 'array'].includes(suggestion.type) &&
						!(<any>(tree ?? this.tree)).children?.find(
							(test: any) => {
								if (test.type === 'array') return false
								return test[0] === suggestion.value
							}
						)
				)
				.concat(
					this.parent.app.project.snippetLoader
						.getSnippetsFor(
							currentFormatVersion,
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
		)
		// console.log(this.propertySuggestions)

		// Only suggest values for empty objects, arrays or "empty" primitive trees
		// (a primitive tree is empty if it contains an empty string)
		if (
			(tree instanceof ObjectTree && tree?.children?.length === 0) ||
			tree instanceof ArrayTree ||
			(tree instanceof PrimitiveTree && tree.isEmpty())
		) {
			this.valueSuggestions = filterDuplicates(
				suggestions.filter((suggestion) => suggestion.type === 'value')
			)
		} else {
			this.valueSuggestions = []
		}

		this.editSuggestions = []
		// Support auto-completions for value edits
		if (isValueSelection && tree instanceof PrimitiveTree) {
			this.editSuggestions = filterDuplicates(
				suggestions.filter((suggestion) => suggestion.type === 'value')
			)
		}
		// Support auto-completions for property edits
		if (tree instanceof ObjectTree) {
			this.editSuggestions = filterDuplicates(
				this.getSuggestions(tree.getParent() ?? undefined).filter(
					(suggestion) => suggestion.type === 'object'
				)
			)
		}
	}, 50)

	createSchemaRoot() {
		const schemaUri = App.fileType.get(this.parent.getPath())?.schema
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

	getSchemas(tree: Tree<unknown> | undefined, next = false) {
		if (
			(this.selections.length === 0 && tree === undefined) ||
			tree === this.tree
		) {
			return this.schemaRoot ? [this.schemaRoot] : []
		} else if (tree) {
			let path = null
			try {
				path = next ? [...tree.path, undefined] : tree.path
			} catch {
				// An error may occur if the tree was deleted while a suggestion update was still scheduled
				return []
			}

			return [
				...new Set(
					this.schemaRoot?.getSchemasFor(this.tree.toJSON(), path) ??
						[]
				),
			]
		}

		return []
	}
	getSuggestions(tree: Tree<unknown> | undefined) {
		const json = tree?.toJSON()

		const schemas = this.getSchemas(tree)
		return schemas
			.filter((schema) => schema !== undefined)
			.map((schema) => schema.getCompletionItems(json))
			.flat()
	}
	getSchemaTypes(next?: boolean) {
		const { tree, isValueSelection } = this.getSelectedTree()
		if (isValueSelection) return new Set()

		// We need to skip the items schema property for correct array item types
		if (next === undefined) next = tree instanceof ArrayTree

		const schemas = this.getSchemas(tree, next)
		if (schemas.length === 0) return new Set()

		return new Set(
			schemas.reduce<TSchemaType[]>((types, schema) => {
				return types.concat(schema.types)
			}, [])
		)
	}
	getSelectedTree() {
		if (this.selections.length === 0)
			return { tree: this.tree, isValueSelection: false }

		const selection = this.selections[0]
		return {
			tree: <ArrayTree | ObjectTree | PrimitiveTree | undefined>(
				selection?.getTree()
			),
			isValueSelection: selection instanceof TreeValueSelection,
		}
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
					sel.dispose()

					const entry = sel.delete()
					if (entry) entries.push(entry)
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
	toJsonString(beautify = false) {
		return JSON.stringify(
			this.toJSON(),
			null,
			beautify ? '\t' : undefined
		).replaceAll('\\\\', '\\')
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

			const entry = selection.addKey(value, type)
			if (entry) entries.push(entry)
		})

		this.history.pushAll(entries)
	}

	addValue(
		value: string,
		type: 'value',
		forcedValueType?: 'number' | 'string' | 'null' | 'boolean' | 'integer'
	) {
		let transformedValue: TPrimitiveTree = inferType(value)

		// Force values for bridge. prediction schema type hints
		if (forcedValueType) {
			if (forcedValueType === 'string') transformedValue = value
			else if (forcedValueType === 'integer')
				transformedValue = parseInt(value)
			else if (forcedValueType === 'number')
				transformedValue = parseFloat(value)
			else if (forcedValueType === 'boolean')
				transformedValue = value === 'true'
			else if (forcedValueType === 'null') transformedValue = null
		}

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
			if (parentTree instanceof PrimitiveTree) return

			const index = parentTree.children.length

			for (const key in json) {
				let newKey = key

				if (parentTree instanceof ObjectTree) {
					while (parentTree.get([newKey]) !== null) newKey += '_copy'
				}

				const newTree = createTree(parentTree, json[key])
				if (parentTree instanceof ObjectTree)
					parentTree.addChild(newKey, newTree)
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

	/**
	 * Get description and title for a given tree
	 * @param tree
	 */
	getDocumentation(tree: Tree<unknown>) {
		const schemas = <RootSchema[]>(
			this.getSchemas(tree).filter(
				(schema) => schema instanceof RootSchema
			)
		)

		if (schemas.length === 0) return

		const title =
			schemas.find((schema) => schema.title !== undefined)?.title ?? ''
		const description =
			schemas.filter((schema) => schema.description !== undefined)?.[0]
				?.description ?? ''

		return { title, text: description }
	}

	pushHistoryEntry(entry: HistoryEntry) {
		this.history.push(entry)
	}
	pushAllHistoryEntries(entries: HistoryEntry[]) {
		this.history.pushAll(entries)
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

		if (event && !this.parent.isReadOnly)
			showContextMenu(event, pasteMenu, {
				card: this.getDocumentation(tree),
			})

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
						viewDocumentation(this.parent.getPath(), word)
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

		if (event)
			showContextMenu(event, readOnlyMenu, {
				card: this.getDocumentation(tree),
			})

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

		showContextMenu(event, contextMenu, {
			card: this.getDocumentation(tree),
			mayCloseOnClickOutside: true,
		})
	}
	undo() {
		this.history.undo()
	}
	redo() {
		this.history.redo()
	}
}

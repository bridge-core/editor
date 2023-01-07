import { FileTab, TReadOnlyMode } from '/@/components/TabSystem/FileTab'
import CodemirrorTabComponent from './CodemirrorTab.vue'
import {
	drawSelection,
	EditorView,
	highlightSpecialChars,
	keymap,
} from '@codemirror/view'
import {
	defaultKeymap,
	historyKeymap,
	indentWithTab,
	history,
} from '@codemirror/commands'
import { EditorState, Compartment } from '@codemirror/state'
import { jsonLanguage } from '@codemirror/lang-json'
import { IDisposable } from '/@/types/disposable'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { debounce } from 'lodash-es'
import { Signal } from '/@/components/Common/Event/Signal'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { markRaw } from 'vue'
import {
	defaultHighlightStyle,
	language,
	syntaxHighlighting,
} from '@codemirror/language'

const throttledCacheUpdate = debounce<(tab: TextTab) => Promise<void> | void>(
	async (tab) => {
		const fileContent = await tab.getFile().then((file) => file.text())
		const app = await App.getApp()

		app.project.fileChange.dispatch(tab.getPath(), await tab.getFile())

		await app.project.packIndexer.updateFile(
			tab.getPath(),
			fileContent,
			tab.isForeignFile,
			true
		)
		await app.project.jsonDefaults.updateDynamicSchemas(tab.getPath())
	},
	600
)

export class CodemirrorTab extends FileTab {
	component = CodemirrorTabComponent
	disposables: (IDisposable | undefined)[] = []
	isActive = false
	protected modelLoaded = new Signal<void>()
	protected initialVersionId: number = 0
	protected _codemirror: EditorView | null = null
	protected readOnlyCompartment = new Compartment()

	get codemirror() {
		if (!this._codemirror) throw new Error('Codemirror not loaded yet')
		return this._codemirror
	}

	static is() {
		return true
	}

	constructor(
		parent: TabSystem,
		fileHandle: AnyFileHandle,
		readOnlyMode?: TReadOnlyMode
	) {
		super(parent, fileHandle, readOnlyMode)

		this.fired.then(async () => {
			const app = await App.getApp()
			await app.projectManager.projectReady.fired

			app.project.tabActionProvider.addTabActions(this)
		})
	}
	async getFile() {
		return new File([this.codemirror.state.sliceDoc(0)], this.name)
	}

	updateUnsavedStatus() {
		// this.setIsUnsaved(
		// 	this.initialVersionId !== this.codemirror.
		// )
	}

	fileDidChange() {
		// Updates the isUnsaved status of the tab
		this.updateUnsavedStatus()

		super.fileDidChange()
	}

	async onActivate() {
		if (this.isActive) return
		this.isActive = true
	}
	async createCodemirrorEditor(container: HTMLDivElement) {
		if (this._codemirror) return

		this._codemirror = markRaw(
			new EditorView({
				doc: await super.getFile().then((file) => file.text()),
				parent: container,
				extensions: [
					highlightSpecialChars(),
					history(),
					drawSelection(),
					syntaxHighlighting(defaultHighlightStyle, {
						fallback: true,
					}),
					keymap.of([
						...defaultKeymap,
						...historyKeymap,
						indentWithTab,
					]),
					language.of(jsonLanguage),
					this.readOnlyCompartment.of(
						EditorView.editable.of(
							this.readOnlyMode === 'off' ? true : false
						)
					),
				],
			})
		)

		this.codemirror.requestMeasure()
	}
	async onDeactivate() {}
	onDestroy() {
		this.disposables.forEach((disposable) => disposable?.dispose())
	}
	focus() {
		this.codemirror.focus()
	}

	async _save() {
		this.isTemporary = false

		const app = await App.getApp()
		const fileType = App.fileType.get(this.getPath())

		const fileContentStr = this.codemirror.state.doc.sliceString(0)

		if (
			// Make sure that there is fileContent to format,
			fileContentStr &&
			fileContentStr !== '' &&
			// ...that we have an action to trigger,
			// ...that the file is a valid fileType,
			fileType &&
			// ...that formatOnSave is enabled,
			(settingsState?.general?.formatOnSave ?? true) &&
			// ...and that the current file type supports formatting
			(fileType?.formatOnSaveCapable ?? true)
		) {
		}

		await this.saveFile()
	}
	protected async saveFile() {
		if (this.editorModel && !this.editorModel.isDisposed()) {
			const writeWorked = await this.writeFile(
				this.editorModel.getValue()
			)

			if (writeWorked) {
				this.setIsUnsaved(false)
				// this.initialVersionId =
				// 	this.editorModel.getAlternativeVersionId()
			}
		} else {
			console.error(`Cannot save file content without active editorModel`)
		}
	}

	setReadOnly(val: TReadOnlyMode) {
		this.readOnlyMode = val
		this.codemirror.dispatch({
			effects: this.readOnlyCompartment.reconfigure(
				EditorView.editable.of(val === 'off' ? true : false)
			),
		})
	}

	async paste() {
		if (this.isReadOnly) return

		this.focus()
		this.editorInstance?.trigger('keyboard', 'paste', {
			text: await navigator.clipboard.readText(),
		})
	}
	cut() {
		if (this.isReadOnly) return

		this.focus()
		document.execCommand('cut')
	}
	async close() {
		const didClose = await super.close()

		// We need to clear the lightning cache store from temporary data if the user doesn't save changes
		if (didClose && this.isUnsaved) {
			const app = await App.getApp()

			if (this.isForeignFile) {
				await app.fileSystem.unlink(this.getPath())
			} else {
				const file = await this.fileHandle.getFile()
				const fileContent = await file.text()
				await app.project.packIndexer.updateFile(
					this.getPath(),
					fileContent
				)
			}
		}

		return didClose
	}
}

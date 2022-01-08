import { FileTab } from '/@/components/TabSystem/FileTab'
import TextTabComponent from './TextTab.vue'
import { editor, Uri } from 'monaco-editor'
import { IDisposable } from '/@/types/disposable'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { debounce } from 'lodash'
import { Signal } from '/@/components/Common/Event/Signal'
import { AnyFileHandle } from '../../FileSystem/Types'
import { markRaw } from '@vue/composition-api'

const throttledCacheUpdate = debounce<(tab: TextTab) => Promise<void> | void>(
	async (tab) => {
		// Updates the isUnsaved status of the tab
		tab.updateUnsavedStatus()

		if (!tab.editorModel || tab.editorModel.isDisposed()) return

		const fileContent = tab.editorModel?.getValue()
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

export class TextTab extends FileTab {
	component = TextTabComponent
	editorModel: editor.ITextModel | undefined
	editorViewState: editor.ICodeEditorViewState | undefined
	disposables: (IDisposable | undefined)[] = []
	isActive = false
	protected modelLoaded = new Signal<void>()
	protected initialVersionId: number = 0

	get editorInstance() {
		return this.parent.monacoEditor
	}

	constructor(
		parent: TabSystem,
		fileHandle: AnyFileHandle,
		isReadOnly = false
	) {
		super(parent, fileHandle, isReadOnly)

		this.fired.then(async () => {
			const app = await App.getApp()
			await app.projectManager.projectReady.fired

			app.project.tabActionProvider.addTabActions(this)
		})
	}
	async getFile() {
		if (!this.editorModel || this.editorModel.isDisposed())
			return await super.getFile()

		return new File([this.editorModel.getValue()], this.name)
	}

	updateUnsavedStatus() {
		if (!this.editorModel || this.editorModel.isDisposed()) return

		this.setIsUnsaved(
			this.initialVersionId !==
				this.editorModel?.getAlternativeVersionId()
		)
	}

	async onActivate() {
		if (this.isActive) return
		this.isActive = true

		await this.parent.fired //Make sure a monaco editor is loaded

		if (!this.editorModel || this.editorModel.isDisposed()) {
			const file = await this.fileHandle.getFile()
			const fileContent = await file.text()
			const uri = Uri.file(this.getPath())

			this.editorModel = markRaw(
				editor.getModel(uri) ??
					editor.createModel(
						fileContent,
						App.fileType.get(this.getPath())?.meta?.language,
						uri
					)
			)
			this.initialVersionId = this.editorModel.getAlternativeVersionId()

			this.modelLoaded.dispatch()
			this.loadEditor()
		} else {
			this.loadEditor()
		}

		this.disposables.push(
			this.editorModel?.onDidChangeContent(() => {
				throttledCacheUpdate(this)
			})
		)
		this.disposables.push(
			this.editorInstance?.onDidFocusEditorText(() => {
				this.parent.setActive(true)
			})
		)

		this.focus()
		this.editorInstance?.layout()
	}
	onDeactivate() {
		// MonacoEditor is defined
		if (this.tabSystem.hasFired) {
			const viewState = this.editorInstance.saveViewState()
			if (viewState) this.editorViewState = markRaw(viewState)
		}

		this.disposables.forEach((disposable) => disposable?.dispose())
		this.isActive = false
	}
	onDestroy() {
		this.disposables.forEach((disposable) => disposable?.dispose())
		this.editorModel?.dispose()
		this.editorModel = undefined
		this.editorViewState = undefined
		this.isActive = false
		this.modelLoaded.resetSignal()
	}
	updateParent(parent: TabSystem) {
		super.updateParent(parent)
	}
	focus() {
		this.editorInstance?.focus()
	}

	loadEditor() {
		if (this.editorModel && !this.editorModel.isDisposed())
			this.editorInstance?.setModel(this.editorModel)
		if (this.editorViewState)
			this.editorInstance?.restoreViewState(this.editorViewState)

		this.editorInstance?.updateOptions({ readOnly: this.isReadOnly })
		this.focus()
	}

	async save() {
		this.isTemporary = false

		const app = await App.getApp()
		const action = this.editorInstance?.getAction(
			'editor.action.formatDocument'
		)
		const fileType = App.fileType.get(this.getPath())

		if (
			action &&
			(settingsState?.general?.formatOnSave ?? true) &&
			(fileType?.formatOnSaveCapable ?? true)
		) {
			app.windows.loadingWindow.open()
			// This is a terrible hack because we need to make sure that the formatter triggers the "onDidChangeContent" event
			// The promise returned by action.run() actually resolves before formatting is done so we need the "onDidChangeContent" event to tell when the formatter is done
			this.editorInstance?.executeEdits('automatic', [
				{
					forceMoveMarkers: false,
					range: {
						startLineNumber: 0,
						endLineNumber: 0,
						startColumn: 0,
						endColumn: 0,
					},
					text: '\t',
				},
			])

			const editPromise = new Promise<void>((resolve) => {
				if (!this.editorModel || this.editorModel.isDisposed())
					return resolve()

				const disposable = this.editorModel?.onDidChangeContent(() => {
					disposable?.dispose()

					resolve()
				})
			})

			const actionPromise = action.run()

			await Promise.all([editPromise, actionPromise])

			await this.saveFile(app)
			app.windows.loadingWindow.close()
		} else {
			await this.saveFile(app)
		}
	}
	protected async saveFile(app: App) {
		if (this.editorModel && !this.editorModel.isDisposed()) {
			this.setIsUnsaved(false)
			this.initialVersionId = this.editorModel.getAlternativeVersionId()

			await app.fileSystem.write(
				this.fileHandle,
				this.editorModel.getValue()
			)
		} else {
			console.error(`Cannot save file content without active editorModel`)
		}
	}

	setReadOnly(val: boolean) {
		this.isReadOnly = val
		this.editorInstance?.updateOptions({ readOnly: val })
	}

	async paste() {
		if (this.isReadOnly) return

		this.editorInstance.focus()
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

	showContextMenu(event: MouseEvent) {
		this.parent.showCustomMonacoContextMenu(event, this)
	}
}

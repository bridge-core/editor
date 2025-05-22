import { FileTab, TReadOnlyMode } from '/@/components/TabSystem/FileTab'
import TextTabComponent from './TextTab.vue'
import type { editor } from 'monaco-editor'
import { IDisposable } from '/@/types/disposable'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { debounce } from 'lodash-es'
import { Signal } from '/@/components/Common/Event/Signal'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { markRaw } from 'vue'
import { loadMonaco, useMonaco } from '../../../utils/libs/useMonaco'
import { wait } from '/@/utils/wait'
import { readText as tauriReadText } from '@tauri-apps/api/clipboard'

const throttledCacheUpdate = debounce<(tab: TextTab) => Promise<void> | void>(
	async (tab) => {
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

	fileDidChange() {
		// Updates the isUnsaved status of the tab
		this.updateUnsavedStatus()

		super.fileDidChange()
	}

	async onActivate() {
		if (this.isActive) return
		this.isActive = true

		// Load monaco in
		if (!loadMonaco.hasFired) {
			this.isLoading = true
			loadMonaco.dispatch()

			// Monaco theme isn't loaded yet
			await this.parent.app.themeManager.applyMonacoTheme()
		}

		const { editor, Uri } = await useMonaco()

		await this.parent.fired //Make sure a monaco editor is loaded
		await wait(1)
		this.isLoading = false

		if (!this.editorModel || this.editorModel.isDisposed()) {
			const file = await this.fileHandle.getFile()
			const fileContent = await file.text()
			// This for some reason fixes monaco suggesting the wrong path for quickfixes #932
			const filePath = this.getPath()
			const uri = Uri.file(
				filePath.endsWith('.ts')
					? filePath.replace('/BP/', '/bp/')
					: filePath
			)

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
			await this.loadEditor(false)
		} else {
			await this.loadEditor()
		}

		this.disposables.push(
			this.editorModel?.onDidChangeContent(() => {
				throttledCacheUpdate(this)
				this.fileDidChange()
			})
		)
		this.disposables.push(
			this.editorInstance?.onDidFocusEditorText(() => {
				this.parent.setActive(true)
			})
		)

		this.editorInstance?.layout()
		super.onActivate()
	}
	async onDeactivate() {
		await super.onDeactivate()

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

	async loadEditor(shouldFocus = true) {
		await this.parent.fired //Make sure a monaco editor is loaded

		if (this.editorModel && !this.editorModel.isDisposed())
			this.editorInstance.setModel(this.editorModel)
		if (this.editorViewState)
			this.editorInstance.restoreViewState(this.editorViewState)

		this.editorInstance?.updateOptions({ readOnly: this.isReadOnly })
		if (shouldFocus) setTimeout(() => this.focus(), 10)
	}

	async _save() {
		this.isTemporary = false

		const app = await App.getApp()
		const action = this.editorInstance?.getAction(
			'editor.action.formatDocument'
		)
		const fileType = App.fileType.get(this.getPath())

		const fileContentStr = this.editorModel?.getValue()

		if (
			// Make sure that there is fileContent to format,
			fileContentStr &&
			fileContentStr !== '' &&
			// ...that we have an action to trigger,
			action &&
			// ...that the file is a valid fileType,
			fileType &&
			// ...that formatOnSave is enabled,
			(settingsState?.general?.formatOnSave ?? true) &&
			// ...and that the current file type supports formatting
			(fileType?.formatOnSaveCapable ?? true)
		) {
			// This is a terrible hack because we need to make sure that the formatter triggers the "onDidChangeContent" event
			// The promise returned by action.run() actually resolves before formatting is done so we need the "onDidChangeContent" event to tell when the formatter is done
			this.makeFakeEdit('\t')

			const editPromise = new Promise<void>((resolve) => {
				if (!this.editorModel || this.editorModel.isDisposed())
					return resolve()

				const disposable = this.editorModel?.onDidChangeContent(() => {
					disposable?.dispose()

					resolve()
				})
			})

			const actionPromise = action.run()

			let didAnyFinish = false
			await Promise.race([
				// Wait for the action to finish
				Promise.all([editPromise, actionPromise]),
				// But don't wait longer than 1.5s, action then likely failed for some weird reason
				wait(1500).then(() => {
					if (didAnyFinish) return

					this.makeFakeEdit(null)
				}),
			])
			didAnyFinish = true
		}

		await this.saveFile()
	}
	protected makeFakeEdit(text: string | null) {
		if (!text) {
			this.editorInstance.trigger('automatic', 'undo', null)
		} else {
			this.editorInstance.pushUndoStop()
			this.editorInstance?.executeEdits('automatic', [
				{
					forceMoveMarkers: false,
					range: {
						startLineNumber: 1,
						endLineNumber: 1,
						startColumn: 1,
						endColumn: 1,
					},
					text,
				},
			])
			this.editorInstance.pushUndoStop()
		}
	}
	protected async saveFile() {
		if (this.editorModel && !this.editorModel.isDisposed()) {
			App.eventSystem.dispatch('beforeModifiedProject', null)

			const writeWorked = await this.writeFile(
				this.editorModel.getValue()
			)

			App.eventSystem.dispatch('modifiedProject', null)

			if (writeWorked) {
				this.setIsUnsaved(false)
				this.initialVersionId =
					this.editorModel.getAlternativeVersionId()
			}
		} else {
			console.error(`Cannot save file content without active editorModel`)
		}
	}

	setReadOnly(val: TReadOnlyMode) {
		this.readOnlyMode = val
		this.editorInstance?.updateOptions({ readOnly: val !== 'off' })
	}

	async paste() {
		if (this.isReadOnly) return

		this.focus()
		this.editorInstance?.trigger('keyboard', 'paste', {
			text: await tauriReadText(),
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

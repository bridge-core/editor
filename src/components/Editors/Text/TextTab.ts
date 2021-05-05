import { FileTab } from '/@/components/TabSystem/FileTab'
import TextTabComponent from './TextTab.vue'
import * as monaco from 'monaco-editor'
import { IDisposable } from '/@/types/disposable'
import { App } from '/@/App'
import { TabSystem } from '/@/components/TabSystem/TabSystem'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { FileType } from '/@/components/Data/FileType'
import { debounce } from 'lodash'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { Signal } from '/@/components/Common/Event/Signal'
import { ParticlePreviewTab } from '/@/components/Editors/ParticlePreview/ParticlePreview'
import { createFromGeometry } from '../EntityModel/create/fromGeometry'
import { createFromClientEntity } from '../EntityModel/create/fromClientEntity'
import { createFromEntity } from '../EntityModel/create/fromEntity'

const throttledCacheUpdate = debounce<(tab: TextTab) => Promise<void> | void>(
	async (tab) => {
		if (!tab.editorModel || tab.editorModel.isDisposed()) return

		const fileContent = tab.editorModel?.getValue()
		const app = await App.getApp()
		await app.project.packIndexer.updateFile(
			tab.getProjectPath(),
			fileContent
		)
		await app.project.jsonDefaults.updateDynamicSchemas(
			tab.getProjectPath()
		)

		app.project.fileChange.dispatch(
			tab.getProjectPath(),
			new File([tab.editorModel?.getValue()], tab.name)
		)
	},
	600
)

export class TextTab extends FileTab {
	component = TextTabComponent
	editorModel: monaco.editor.ITextModel | undefined
	editorViewState: monaco.editor.ICodeEditorViewState | undefined
	disposables: (IDisposable | undefined)[] = []
	isActive = false
	protected modelLoaded = new Signal<void>()

	get editorInstance() {
		return this.parent.monacoEditor
	}

	constructor(parent: TabSystem, fileHandle: FileSystemFileHandle) {
		super(parent, fileHandle)

		this.fired.then(async () => {
			const app = await App.getApp()

			if (this.getProjectPath().startsWith('RP/models/')) {
				this.addAction(
					new SimpleAction({
						icon: 'mdi-play',
						name: 'preview.viewModel',
						onTrigger: async () => {
							if (!this.editorModel) return

							const tab = await createFromGeometry(this)
							if (!tab) return

							this.connectedTabs.push(tab)
							app.project.tabSystem?.add(tab, true)
						},
					})
				)
			} else if (this.getProjectPath().startsWith('RP/entity/')) {
				this.addAction(
					new SimpleAction({
						icon: 'mdi-play',
						name: 'preview.viewModel',
						onTrigger: async () => {
							if (!this.editorModel) return

							const tab = await createFromClientEntity(this)
							if (!tab) return

							this.connectedTabs.push(tab)
							app.project.tabSystem?.add(tab, true)
						},
					})
				)
			} else if (this.getProjectPath().startsWith('BP/entities/')) {
				this.addAction(
					new SimpleAction({
						icon: 'mdi-play',
						name: 'preview.viewEntity',
						onTrigger: async () => {
							if (!this.editorModel) return

							const tab = await createFromEntity(this)
							if (!tab) return

							this.connectedTabs.push(tab)
							app.project.tabSystem?.add(tab, true)
						},
					})
				)
			} else if (this.getProjectPath().startsWith('RP/animations/')) {
				// this.addAction(
				// 	new SimpleAction({
				// 		icon: 'mdi-play',
				// 		name: 'preview.viewAnimation',
				// 		onTrigger: async () => {
				// 			if (!this.editorModel) return
				// 			const tab = new EntityModelTab(
				// 				this,
				// 				this.parent,
				// 				this.fileHandle
				// 			)
				// 			this.connectedTabs.push(tab)
				// 			app.project.tabSystem?.add(tab, true)
				// 		},
				// 	})
				// )
			} else if (this.getProjectPath().startsWith('RP/particles/')) {
				this.addAction(
					new SimpleAction({
						icon: 'mdi-play',
						name: 'preview.viewParticle',
						onTrigger: async () => {
							if (!this.editorModel) return

							const tab = new ParticlePreviewTab(
								this,
								this.parent,
								this.fileHandle
							)
							this.connectedTabs.push(tab)
							app.project.tabSystem?.add(tab, true)
						},
					})
				)
			}
		})
	}
	async getFile() {
		if (!this.editorModel || this.editorModel.isDisposed())
			return await super.getFile()

		return new File([this.editorModel.getValue()], this.name)
	}

	setIsUnsaved(val: boolean) {
		super.setIsUnsaved(val)
	}

	async onActivate() {
		if (this.isActive) return
		this.isActive = true

		const app = await App.getApp()
		await this.parent.fired //Make sure a monaco editor is loaded

		if (!this.editorModel) {
			const file = await this.fileHandle.getFile()
			const fileContent = await file.text()
			const uri = monaco.Uri.file(this.getPath())

			this.editorModel =
				monaco.editor.getModel(uri) ??
				monaco.editor.createModel(fileContent, undefined, uri)
			this.modelLoaded.dispatch()
			this.loadEditor()
		} else {
			this.loadEditor()
		}

		this.disposables.push(
			this.editorModel?.onDidChangeContent(() => {
				this.isUnsaved = true
				throttledCacheUpdate(this)
			})
		)
		this.disposables.push(
			this.editorInstance?.onDidFocusEditorText(() => {
				this.parent.setActive(true)
			})
		)

		this.editorInstance?.focus()
		this.editorInstance?.layout()
	}
	onDeactivate() {
		// MonacoEditor is defined
		if (this.tabSystem.hasFired)
			this.editorViewState =
				this.editorInstance?.saveViewState() ?? undefined
		this.disposables.forEach((disposable) => disposable?.dispose())
		this.isActive = false
	}
	onDestroy() {
		this.disposables.forEach((disposable) => disposable?.dispose())
		this.editorModel?.dispose()
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
		if (this.editorModel) this.editorInstance?.setModel(this.editorModel)
		if (this.editorViewState)
			this.editorInstance?.restoreViewState(this.editorViewState)
	}

	async save() {
		const app = await App.getApp()
		const action = this.editorInstance?.getAction(
			'editor.action.formatDocument'
		)
		const fileType = FileType.get(this.getProjectPath())

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

			const disposable = this.editorModel?.onDidChangeContent(
				async () => {
					disposable?.dispose()

					await this.saveFile(app)

					app.windows.loadingWindow.close()
				}
			)

			await action.run()
		} else {
			await this.saveFile(app)
		}
	}
	protected async saveFile(app: App) {
		this.isUnsaved = false
		if (this.editorModel) {
			await app.fileSystem.write(
				this.fileHandle,
				this.editorModel.getValue()
			)
		}
	}

	async paste() {
		this.editorInstance?.trigger('keyboard', 'paste', {
			text: await navigator.clipboard.readText(),
		})
	}
	async close() {
		await super.close()

		// We need to clear the lightning cache store from temporary data if the user doesn't save changes
		if (this.isUnsaved) {
			const app = await App.getApp()
			const file = await app.fileSystem.readFile(this.getPath())
			const fileContent = await file.text()
			await app.project.packIndexer.updateFile(
				this.getProjectPath(),
				fileContent
			)
		}
	}
}

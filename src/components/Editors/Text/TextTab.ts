import { Tab } from '@/components/TabSystem/CommonTab'
import MonacoEditor from './Main.vue'
import * as monaco from 'monaco-editor'
import { Disposable } from '@/types/disposable'
import { on } from '@/appCycle/EventSystem'
import {
	RemoteCursorManager,
	RemoteSelectionManager,
	EditorContentManager,
} from '@convergencelabs/monaco-collab-ext'
import { dispatchEvent } from '@/appCycle/remote/Client'

export class TextTab extends Tab {
	component = MonacoEditor
	editorInstance: monaco.editor.ICodeEditor | undefined
	editorModel: monaco.editor.ITextModel | undefined
	editorViewState: monaco.editor.ICodeEditorViewState | undefined
	disposables: Disposable[] = []
	editorContentManager: EditorContentManager | undefined

	setIsUnsaved(val: boolean, changedData?: string) {
		super.setIsUnsaved(val)

		if (this.hasRemoteChange && !this.isSelected && changedData) {
			this.editorModel?.setValue(changedData)
			this.hasRemoteChange = false
		}
	}

	receiveEditorInstance(editorInstance: monaco.editor.IStandaloneCodeEditor) {
		if (this.editorInstance) return

		this.editorInstance = editorInstance
		this.editorInstance.layout()
	}

	async onActivate() {
		if (this.editorModel === undefined) {
			const file = await (await this.fileSystem).readFile(this.path)
			const fileContent = await file.text()

			this.editorModel = monaco.editor.createModel(
				fileContent,
				undefined,
				monaco.Uri.file(this.path.join('/'))
			)
			this.loadEditor()
		} else {
			this.loadEditor()
		}

		this.disposables.push(
			on('bridge:onResize', () => this.editorInstance?.layout())
		)
		const strPath = this.path.join('/')
		this.editorContentManager = new EditorContentManager({
			// @ts-ignore
			editor: this.editorInstance,
			onInsert(index, text) {
				dispatchEvent(
					'textEditorTab',
					`insert(${strPath})`,
					index,
					text
				)
			},
			onReplace(index, length, text) {
				dispatchEvent(
					'textEditorTab',
					`replace(${strPath})`,
					index,
					length,
					text
				)
			},
			onDelete(index, length) {
				dispatchEvent(
					'textEditorTab',
					`delete(${strPath})`,
					index,
					length
				)
			},
		})
		this.disposables.push(
			...[
				on(
					`bridge:remote.textEditorTab.insert(${strPath})`,
					(index, text) =>
						this.editorContentManager?.insert(
							index as number,
							text as string
						)
				),
				on(
					`bridge:remote.textEditorTab.replace(${strPath})`,
					(index, length, text) =>
						this.editorContentManager?.replace(
							index as number,
							length as number,
							text as string
						)
				),
				on(
					`bridge:remote.textEditorTab.delete(${strPath})`,
					(index, length) =>
						this.editorContentManager?.delete(
							index as number,
							length as number
						)
				),
			]
		)
	}
	onDeactivate() {
		this.editorViewState = this.editorInstance?.saveViewState() ?? undefined
		this.disposables.forEach(disposable => disposable.dispose())
		this.editorContentManager?.dispose()
	}
	onDestroy() {
		this.editorModel?.dispose()
	}

	loadEditor() {
		if (this.editorModel) this.editorInstance?.setModel(this.editorModel)
		if (this.editorViewState)
			this.editorInstance?.restoreViewState(this.editorViewState)

		this.editorModel?.onDidChangeContent(() => {
			this.isUnsaved = true
			dispatchEvent(
				'tabSystem',
				'setUnsaved',
				this.path,
				true,
				this.editorModel?.getValue()
			)
		})
	}

	async save() {
		this.isUnsaved = false
		dispatchEvent(
			'tabSystem',
			'setUnsaved',
			this.path,
			false,
			this.editorModel?.getValue()
		)
		if (this.editorModel) {
			await (await this.fileSystem).writeFile(
				this.path,
				this.editorModel.getValue()
			)
		}
	}
}

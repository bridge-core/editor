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
import { dispatchEvent, dispatchRemoteAction } from '@/appCycle/remote/Client'
import { peerState } from '@/appCycle/remote/Peer'
import { currentActiveUsers } from '@/appCycle/remote/Host'

export class TextTab extends Tab {
	component = MonacoEditor
	editorInstance: monaco.editor.ICodeEditor | undefined
	editorModel: monaco.editor.ITextModel | undefined
	editorViewState: monaco.editor.ICodeEditorViewState | undefined
	disposables: (Disposable | undefined)[] = []
	editorContentManager: EditorContentManager | undefined
	remoteCursors: RemoteCursorManager | undefined
	remoteEdits: monaco.editor.IModelContentChange[] = []

	setIsUnsaved(
		val: boolean,
		changedData?: monaco.editor.IModelContentChange[]
	) {
		super.setIsUnsaved(val)

		if (this.hasRemoteChange && !this.isSelected && changedData) {
			this.remoteEdits.push(...changedData)
			this.hasRemoteChange = true
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
				monaco.Uri.file(this.path)
			)
			this.loadEditor()
		} else {
			this.loadEditor()
		}

		this.disposables.push(
			on('bridge:onResize', () => this.editorInstance?.layout())
		)
		this.remoteCursors = new RemoteCursorManager({
			// @ts-ignore
			editor: this.editorInstance,
			tooltips: true,
			tooltipDuration: 2,
		})

		const strPath = this.path
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
				on(`bridge:remote.textEditorTab.addCursor`, (id, name) =>
					this.disposables.push(
						this.remoteCursors?.addCursor(
							id as string,
							'blue',
							name as string
						)
					)
				),
				on(`bridge:remote.textEditorTab.cursorChange`, (id, offset) =>
					this.remoteCursors?.setCursorOffset(
						id as string,
						offset as number
					)
				),
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
		this.disposables.forEach(disposable => disposable?.dispose())
		this.editorContentManager?.dispose()
	}
	onDestroy() {
		this.editorModel?.dispose()
	}

	loadEditor() {
		if (this.editorModel) this.editorInstance?.setModel(this.editorModel)
		if (this.editorViewState)
			this.editorInstance?.restoreViewState(this.editorViewState)

		this.remoteEdits.forEach(change => {
			const { rangeOffset, rangeLength, text } = change
			if (text.length > 0 && rangeLength === 0) {
				this.editorContentManager?.insert(rangeOffset, text)
			} else if (text.length > 0 && rangeLength > 0) {
				this.editorContentManager?.replace(
					rangeOffset,
					rangeLength,
					text
				)
			} else if (text.length === 0 && rangeLength > 0) {
				this.editorContentManager?.delete(rangeOffset, rangeLength)
			} else {
				throw new Error('Unexpected change: ' + JSON.stringify(change))
			}
		})
		this.remoteEdits = []

		this.disposables.push(
			this.editorModel?.onDidChangeContent(event => {
				this.isUnsaved = true

				dispatchEvent(
					'tabSystem',
					'setUnsaved',
					this.path,
					true,
					event.changes
				)
			})
		)
	}

	async save() {
		this.isUnsaved = false
		dispatchEvent('tabSystem', 'setUnsaved', this.path, false)
		if (this.editorModel) {
			await (await this.fileSystem).writeFile(
				this.path,
				this.editorModel.getValue()
			)
		}
	}
}

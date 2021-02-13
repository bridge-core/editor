import { IDisposable } from '@/types/disposable'
import debounce from 'lodash.debounce'
import { languages, editor } from 'monaco-editor'

export interface IAddLanguageOptions {
	id: string
	extensions: string[]
	config: languages.LanguageConfiguration
	tokenProvider: any
}

export abstract class Language {
	protected id: string
	protected disposables: IDisposable[] = []
	protected models = new Map<string, IDisposable>()

	constructor({
		id,
		extensions,
		config,
		tokenProvider,
	}: IAddLanguageOptions) {
		this.id = id

		languages.register({ id, extensions })
		this.disposables = [
			languages.setLanguageConfiguration(id, config),
			languages.setMonarchTokensProvider(id, tokenProvider),
			editor.onDidCreateModel(this.onModelAdded.bind(this)),
			editor.onWillDisposeModel(this.onModelRemoved.bind(this)),
			editor.onDidChangeModelLanguage(event => {
				this.onModelRemoved(event.model)
				this.onModelAdded(event.model)
			}),
		]
	}

	protected onModelAdded(model: editor.IModel) {
		if (model.getModeId() !== this.id) return

		this.validate(model)
		this.models.set(
			model.uri.toString(),
			model.onDidChangeContent(
				debounce(event => this.validate(model, event), 500)
			)
		)
	}
	protected onModelRemoved(model: editor.IModel) {
		editor.setModelMarkers(model, this.id, [])

		const uriStr = model.uri.toString()
		this.models.get(uriStr)?.dispose()
		this.models.delete(uriStr)
	}

	abstract validate(
		model: editor.IModel,
		event?: editor.IModelChangedEvent
	): Promise<void> | void

	dispose() {
		this.disposables.forEach(disposable => disposable.dispose())
		this.disposables = []
	}
}

import { IDisposable } from '/@/types/disposable'
import { debounce } from 'lodash-es'
import type { languages, editor } from 'monaco-editor'
import { useMonaco } from '../../utils/libs/useMonaco'

export interface IAddLanguageOptions {
	id: string
	extensions: string[]
	config: languages.LanguageConfiguration
	tokenProvider: any
	completionItemProvider?: languages.CompletionItemProvider
	codeActionProvider?: languages.CodeActionProvider
	signatureHelpProvider?: languages.SignatureHelpProvider
}

export abstract class Language {
	protected id: string
	protected disposables: IDisposable[] = []
	protected models = new Map<string, IDisposable>()
	protected highlighter?: IDisposable

	constructor({
		id,
		extensions,
		config,
		tokenProvider,
		completionItemProvider,
		codeActionProvider,
		signatureHelpProvider,
	}: IAddLanguageOptions) {
		this.id = id

		useMonaco().then(({ languages, editor }) => {
			languages.register({ id, extensions })
			this.disposables = [
				languages.setLanguageConfiguration(id, config),
				editor.onDidCreateModel(this.onModelAdded.bind(this)),
				editor.onWillDisposeModel(this.onModelRemoved.bind(this)),
				editor.onDidChangeModelLanguage((event) => {
					this.onModelRemoved(event.model)
					this.onModelAdded(event.model)
				}),
			]
			this.highlighter = languages.setMonarchTokensProvider(
				id,
				tokenProvider
			)

			if (completionItemProvider)
				this.disposables.push(
					languages.registerCompletionItemProvider(
						id,
						completionItemProvider
					)
				)
			if (codeActionProvider)
				this.disposables.push(
					languages.registerCodeActionProvider(id, codeActionProvider)
				)
			if (signatureHelpProvider)
				this.disposables.push(
					languages.registerSignatureHelpProvider(
						id,
						signatureHelpProvider
					)
				)
		})
	}

	updateTokenProvider(tokenProvider: any) {
		useMonaco().then(({ languages }) => {
			this.highlighter?.dispose()
			this.highlighter = languages.setMonarchTokensProvider(
				this.id,
				tokenProvider
			)
		})
	}

	protected onModelAdded(model: editor.IModel) {
		if (model.getLanguageId() !== this.id) return false

		this.validate(model)
		this.models.set(
			model.uri.toString(),
			model.onDidChangeContent(
				debounce((event) => this.validate(model, event), 500)
			)
		)

		return true
	}
	protected onModelRemoved(model: editor.IModel) {
		useMonaco().then(({ editor }) => {
			editor.setModelMarkers(model, this.id, [])
		})

		const uriStr = model.uri.toString()
		this.models.get(uriStr)?.dispose()
		this.models.delete(uriStr)
	}

	abstract validate(
		model: editor.IModel,
		event?: editor.IModelChangedEvent
	): Promise<void> | void

	dispose() {
		this.highlighter?.dispose()
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []
	}
}

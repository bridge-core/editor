import { languages } from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker'

export function setupLanguageWorkers() {
	//@ts-ignore
	window.MonacoEnvironment = {
		getWorker(_: unknown, label: string) {
			if (label === 'json') {
				return new jsonWorker()
			}
			if (label === 'typescript' || label === 'javascript') {
				return new tsWorker()
			}

			return new editorWorker()
		},
	}
}

export function defineSchemas(schemas: any[]) {
	languages.json.jsonDefaults.setDiagnosticsOptions({
		enableSchemaRequest: false,
		allowComments: true,
		validate: true,
		schemas,
	})
}

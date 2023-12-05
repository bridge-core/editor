import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker'

export function setupMonaco() {
	// @ts-ignore
	window.MonacoEnvironment = {
		getWorker(_: unknown, label: string) {
			// if (label === 'json') {
			// 	return new jsonWorker()
			// }

			// if (label === 'typescript' || label === 'javascript') {
			// 	return new tsWorker()
			// }

			return new editorWorker()
		},
	}
}

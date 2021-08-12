import '/@/components/App/setupCompositionAPI'
import '/@/components/FileSystem/Polyfill'
import '/@/components/FileSystem/Virtual/Comlink'
import { vue } from '/@/components/App/Vue'
import '@mdi/font/css/materialdesignicons.min.css'
import { App } from './App'
import '/@/utils/locales'

// Disable until we move back to vite
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker.js?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker.js?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker'
// @ts-ignore
self.MonacoEnvironment = {
	getWorker(_: unknown, label: string) {
		if (label === 'json') {
			return new jsonWorker()
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return new cssWorker()
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return new htmlWorker()
		}
		if (label === 'typescript' || label === 'javascript') {
			return new tsWorker()
		}
		return new editorWorker()
	},
}

App.main(vue)

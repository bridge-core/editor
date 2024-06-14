import './style.css'

import { initRuntimes } from '@bridge-editor/dash-compiler'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker'
import { createApp } from 'vue'
import App from '@/App.vue'

// We have to do this in order to fix wasm not being intialized when testing dev builds of dash
initRuntimes(wasmUrl)

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

createApp(App).mount('#app')

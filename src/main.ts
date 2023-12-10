import './style.css'

import { initRuntimes } from 'dash-compiler'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker'
import { createApp } from 'vue'
import App from '@/App.vue'

// WARNING TO ANYONE READING THIS: I have wasted so many hours trying to figure out why this doesn't work
// when you using npm link to use a dev version of dash-compiler and then do npm run dev:force. It give a strange wasm error.
// The fix is to delete the .vite folder in node-modules, then do normal npm run dev. Then it works. I have no idea why.
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

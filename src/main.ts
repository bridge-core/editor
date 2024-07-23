import '/@/components/FileSystem/Polyfill'
import '/@/components/FileSystem/Virtual/Comlink'
import { App } from './App'
import { vue } from '/@/components/App/Vue'
import '@mdi/font/css/materialdesignicons.min.css'

// Disable until we move back to vite
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker.js?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker.js?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker'
import { initRuntimes } from '@bridge-editor/js-runtime'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import './main.css'

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

initRuntimes(wasmUrl)

App.main(vue)

if ('launchQueue' in window) {
	;(<any>window).launchQueue.setConsumer(async (launchParams: any) => {
		const app = await App.getApp()

		if (launchParams.targetURL)
			await app.startParams.parse(launchParams.targetURL)

		if (!launchParams.files.length) return

		for (const fileHandle of launchParams.files) {
			await app.fileDropper.importFile(fileHandle)
		}
	})
}

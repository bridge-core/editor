import { App } from '/@/App'
import { Dialog } from './Dialog/Dialog'
import { BlockbenchAction } from './Actions/Action'
import { MenuBar } from './Menu/MenuBar'
import { Setting } from './Settings/Setting'
import { Settings } from './Settings/Settings'
import { Blockbench } from './Blockbench'
import { Format } from './Format/Format'
import { addStartScreenSection } from './StartScreen/addSection'
import { v4 as uuid } from 'uuid'
import { JSZip } from './JSZip'
import Vue from 'vue'
import { ModelLoader } from './ModelLoader/ModelLoader'
import { VAutocomplete } from 'vuetify/lib'

export async function loadPlugin(fileContent: string) {
	const app = await App.getApp()

	let cleanupHandler: (() => unknown) | null = null

	// Import JQuery as some Blockbench plugins use it
	// @ts-ignore No type definitions needed
	await import('https://code.jquery.com/jquery-3.6.1.slim.min.js')
	await import('../Base.css')

	console.log(MenuBar.menus)

	const plugin = {
		register(id: string, context: any) {
			console.log(id)
			// TODO: Show Blockbench plugins within extension list

			// No valid plugin context, return
			if (typeof context !== 'object' || context === null) return

			if (typeof context.onload === 'function') context.onload()
			if (typeof context.onunload === 'function')
				cleanupHandler = () => context.onunload()
		},
	}

	// Vue global components
	Vue.component('select-input', {
		components: { VAutocomplete },
		props: ['options', 'value'],
		computed: {
			transformedOptions() {
				return Object.entries(this.options).map(
					([id, displayText]) => ({
						text: displayText,
						value: id,
					})
				)
			},
		},
		template: `
			<v-autocomplete
				dense
				outlined
				:items="transformedOptions"
				:value="value"
				@input="$emit('input', $event)"
			/>
		`,
	})

	const blockbenchApi = {
		isApp: false,
		Plugin: plugin,
		BBPlugin: plugin,

		Dialog,
		Action: BlockbenchAction,
		ModelLoader,
		MenuBar,
		Setting,
		Settings,
		Blockbench,
		Format,
		addStartScreenSection,
		JSZip,
		Vue,
		guid: () => uuid(),
		compileJSON: (json: any) => {
			return JSON.stringify(json, null, '\t')
		},
	}

	runJavaScript(fileContent, blockbenchApi)

	// for (const key in blockbenchApi) {
	// 	// @ts-ignore
	// 	window[key] = blockbenchApi[key]
	// }

	return {
		dispose: () => {
			if (cleanupHandler) cleanupHandler()
		},
	}
}

export function runJavaScript(js: string, env: Record<string, unknown>) {
	return new Function(...Object.keys(env), js)(...Object.values(env))
}

loadPlugin(await fetch('/entityWizard.js').then((resp) => resp.text()))
loadPlugin(await fetch('/blockWizard.js').then((resp) => resp.text()))

import { ref } from 'vue'
import { JSX } from 'solid-js/types'
import './BottomPanel.css'
import { Terminal } from '../Terminal/Terminal'
import { TerminalOutput } from '../Terminal/Output'
import { TerminalInput } from '../Terminal/Input'
import { LogPanel } from '../Compiler/LogPanel/Panel'
import { App } from '/@/App'

interface ITab {
	name: string
	icon: string
	component: () => JSX.Element
}

export class BottomPanel {
	public readonly isVisible = ref(true)
	public readonly height = ref(300)
	public readonly tabs = ref<ITab[]>([])
	public readonly activeTab = ref<ITab | null>(null)
	public readonly terminal?: Terminal

	constructor() {
		if (import.meta.env.VITE_IS_TAURI_APP) {
			this.terminal = new Terminal()

			this.addTab({
				icon: 'mdi-console-line',
				name: 'Terminal',
				component: () => (
					<>
						<TerminalInput terminal={this.terminal!} />
						<TerminalOutput terminal={this.terminal!} />
					</>
				),
			})
		}

		setTimeout(() => {
			App.getApp().then((app) => {
				this.addTab({
					icon: 'mdi-cogs',
					name: 'Compiler',
					component: () =>
						LogPanel({
							compilerWindow: app.windows.compilerWindow,
						}),
				})
			})
		})
	}

	selectTab(tab: ITab) {
		this.activeTab.value = tab
	}
	addTab(tab: ITab) {
		this.tabs.value.push(tab)
		if (this.activeTab.value === null) {
			this.activeTab.value = tab
		}
	}
}

import { ref } from 'vue'
import { JSX } from 'solid-js/types'
import './BottomPanel.css'
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

	constructor() {
		this.setupTerminal()

		this.addTab({
			icon: 'mdi-bug',
			name: 'Problems',
			component: () => (
				<div class="text--disabled">
					We are still working on displaying problems with your
					project here...
				</div>
			),
		})

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

	async setupTerminal() {
		if (!import.meta.env.VITE_IS_TAURI_APP) return
		const { Terminal } = await import('/@/components/Terminal/Terminal')
		const { TerminalInput } = await import('/@/components/Terminal/Input')
		const { TerminalOutput } = await import('/@/components/Terminal/Output')

		const terminal = new Terminal()

		this.addTab(
			{
				icon: 'mdi-console-line',
				name: 'Terminal',
				component: () => (
					<>
						<TerminalInput terminal={terminal} />
						<TerminalOutput terminal={terminal} />
					</>
				),
			},
			true
		)
	}

	selectTab(tab: ITab) {
		this.activeTab.value = tab
	}
	addTab(tab: ITab, asFirst = false) {
		if (asFirst) this.tabs.value.unshift(tab)
		else this.tabs.value.push(tab)

		if (this.activeTab.value === null || asFirst) {
			this.activeTab.value = tab
		}
	}
}

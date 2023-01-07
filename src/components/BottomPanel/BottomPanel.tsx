import { computed, ref } from 'vue'
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
	public readonly isVisible = ref(false)
	public readonly height = ref(400)
	public readonly tabs = ref<ITab[]>([])
	public readonly activeTab = ref<ITab | null>(null)
	public readonly currentHeight = computed(() =>
		this.isVisible.value ? this.height.value : 0
	)

	constructor() {
		this.setupTerminal()

		this.addTab({
			icon: 'mdi-bug',
			name: 'bottomPanel.problems.name',
			component: () => (
				<>
					<div class="text--disabled">
						We are still working on displaying problems with your
						project here...
					</div>
				</>
			),
		})

		setTimeout(() => {
			App.getApp().then((app) => {
				this.addTab({
					icon: 'mdi-cogs',
					name: 'bottomPanel.compiler.name',
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
		const { Terminal } = await import('./Terminal/Terminal')
		const { TerminalInput } = await import('./Terminal/Input')
		const { TerminalOutput } = await import('./Terminal/Output')

		const terminal = new Terminal()

		this.addTab(
			{
				icon: 'mdi-console-line',
				name: 'bottomPanel.terminal.name',
				component: () => (
					<>
						<TerminalOutput terminal={terminal} />
						<TerminalInput terminal={terminal} />
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

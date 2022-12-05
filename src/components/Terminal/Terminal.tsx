import { SidebarContent } from '/@/components/Sidebar/Content/SidebarContent'
import { SidebarAction } from '/@/components/Sidebar/Content/SidebarAction'
import { markRaw, ref } from 'vue'
import { InfoPanel } from '/@/components/InfoPanel/InfoPanel'
import { invoke } from '@tauri-apps/api/tauri'
import { pathFromHandle } from '../FileSystem/Virtual/pathFromHandle'
import { App } from '/@/App'
import { For, Component, createSignal, createEffect } from 'solid-js'
import { toVue } from '../Solid/toVue'
import { TextField } from '../Solid/Inputs/TextField/TextField'
import { toSignal } from '../Solid/toSignal'
import './Terminal.css'

interface ICommand {
	// Format HH:MM:SS
	time: string
	command: string
	stdout: string[]
	stderr: string[]
}

export class Terminal extends SidebarContent {
	component = markRaw(toVue(TerminalComponent))
	headerSlot = markRaw(toVue(TerminalHeader))
	actions: SidebarAction[] = []
	headerHeight = '58px'
	output = ref<ICommand[]>([])
	hasRunningTask = ref(false)

	constructor() {
		super()

		this.setup()
	}

	async setup() {
		// this.actions.push(
		// 	new SidebarAction({
		// 		icon: 'mdi-dots-vertical',
		// 		name: 'general.more',
		// 		onTrigger: (event) => {},
		// 	})
		// )
	}

	async executeCommand(command: string) {
		this.hasRunningTask.value = true

		const app = await App.getApp()
		const [stdout, stderr] = await invoke<string>('execute_command', {
			cwd: await pathFromHandle(app.project.baseDirectory),
			command,
		})

		this.output.value.unshift({
			time: new Date().toLocaleTimeString(),
			command,
			stdout: stdout.split('\n'),
			stderr: stderr.split('\n'),
		})

		this.hasRunningTask.value = false
	}
}

const TerminalHeader: Component<{
	sidebarContent: Terminal
}> = (props) => {
	const [input, setInput] = createSignal('')
	const [hasRunningTask] = toSignal(props.sidebarContent.hasRunningTask)

	const onEnter = () => {
		props.sidebarContent.executeCommand(input())
		setInput('')
	}

	return (
		<TextField
			class="ma-2"
			prependIcon="mdi-chevron-right"
			placeholder="Enter command..."
			model={[input, setInput]}
			onEnter={onEnter}
			disabled={hasRunningTask()}
		/>
	)
}

const TerminalComponent: Component<{
	sidebarContent: Terminal
}> = (props) => {
	const [output] = toSignal(props.sidebarContent.output)

	return (
		<div class="ma-2">
			<For each={output()}>
				{({ command, time, stdout, stderr }) => (
					<div class="mb-2">
						<span class="font-weight-medium terminal-line">
							<span class="text--disabled mr-1">[{time}]</span>
							{command}
						</span>

						<div class="ml-4">
							<For each={stdout}>
								{(line) => (
									<div class="terminal-line">{line}</div>
								)}
							</For>

							<For each={stderr}>
								{(line) => (
									<div class="terminal-line error--text">
										{line}
									</div>
								)}
							</For>
						</div>
					</div>
				)}
			</For>
		</div>
	)
}

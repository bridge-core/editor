import { SidebarContent } from '/@/components/Sidebar/Content/SidebarContent'
import { SidebarAction } from '/@/components/Sidebar/Content/SidebarAction'
import { markRaw, ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'
import { pathFromHandle } from '../FileSystem/Virtual/pathFromHandle'
import { App } from '/@/App'
import { For, Component, createSignal, Show } from 'solid-js'
import { toVue } from '../Solid/toVue'
import { TextField } from '../Solid/Inputs/TextField/TextField'
import { toSignal } from '../Solid/toSignal'
import './Terminal.css'
import { Signal } from '../Common/Event/Signal'
import { appLocalDataDir, isAbsolute, join } from '@tauri-apps/api/path'
import { SolidIcon } from '../Solid/Icon/SolidIcon'
import { exists } from '@tauri-apps/api/fs'

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
	baseCwd = ''
	cwd = ref('')
	setupDone = markRaw(new Signal<void>())

	constructor() {
		super()

		this.setup()
	}

	async setup() {
		const app = await App.getApp()
		await app.projectManager.projectReady.fired

		this.baseCwd = await join(await appLocalDataDir(), 'bridge')

		if (this.cwd.value === '') this.cwd.value = this.baseCwd

		this.setupDone.dispatch()
	}

	protected async handleCdCommand(command: string) {
		const path = command.substring(3)
		const stderr: string[] = []

		const prevCwd = this.cwd.value

		if (await isAbsolute(path)) {
			this.cwd.value = path
		} else {
			this.cwd.value = await join(this.cwd.value, path)
		}

		// Confirm that the path exists
		if (!(await exists(this.cwd.value))) {
			this.cwd.value = prevCwd
			stderr.push(`cd: no such directory: ${path}`)
		}

		// Ensure that cwd doesn't leave the baseCwd
		if (!this.cwd.value.startsWith(this.baseCwd)) {
			this.cwd.value = prevCwd
			stderr.push('cd: Permission denied')
		}

		this.output.value.unshift({
			time: new Date().toLocaleTimeString(),
			command,
			stdout: [],
			stderr,
		})
	}

	async executeCommand(command: string) {
		if (command.startsWith('cd ')) {
			await this.handleCdCommand(command)
			return
		}

		this.hasRunningTask.value = true

		await this.setupDone.fired

		const [stdout, stderr] = await invoke<string>('execute_command', {
			cwd: this.cwd.value,
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
	const [cwd] = toSignal(props.sidebarContent.cwd)

	const prettyCwd = () => {
		const tmp = cwd()
			.replace(props.sidebarContent.baseCwd, '')
			.replace(/\\/g, '/')
		if (tmp === '') return 'bridge'
		return `bridge${tmp}`
	}

	return (
		<div class="ma-2">
			{/* Show current cwd */}
			<span class="terminal-line d-flex align-center font-weight-medium primary--text">
				<Show when={prettyCwd() !== ''}>
					<SolidIcon icon="mdi-folder-open-outline" class="mr-1" />
				</Show>

				{prettyCwd()}
			</span>

			{/* Render terminal output */}
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

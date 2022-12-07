import { markRaw, ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'
import { App } from '/@/App'
import { Signal } from '../../Common/Event/Signal'
import { appLocalDataDir, isAbsolute, join, sep } from '@tauri-apps/api/path'
import { exists } from '@tauri-apps/api/fs'
import { listen, Event } from '@tauri-apps/api/event'
import './Terminal.css'

type TMessageKind = 'stdout' | 'stderr' | 'stdin'

interface IMessage {
	// Format HH:MM:SS
	time: string
	kind: TMessageKind
	currentCwdName: string
	msg: string
}

interface IMessagePayload {
	message: string
}

export class Terminal {
	output = ref<IMessage[]>([])
	hasRunningTask = ref(false)
	baseCwd = ''
	cwd = ref('')
	setupDone = markRaw(new Signal<void>())

	constructor() {
		setTimeout(() => this.setup())

		listen('onStdoutMessage', ({ payload }: Event<IMessagePayload>) => {
			this.addToOutput(payload.message, 'stdout')
		})
		listen('onStderrMessage', ({ payload }: Event<IMessagePayload>) => {
			this.addToOutput(payload.message, 'stderr')
		})
		listen('onCommandDone', () => {
			this.hasRunningTask.value = false
		})
	}

	async setup() {
		const app = await App.getApp()
		await app.projectManager.projectReady.fired

		this.baseCwd = await join(await appLocalDataDir(), 'bridge')

		if (this.cwd.value === '') this.cwd.value = this.baseCwd

		this.setupDone.dispatch()
	}

	addToOutput(msg: string, kind: TMessageKind) {
		this.output.value.unshift({
			time: new Date().toLocaleTimeString(),
			kind,
			currentCwdName: this.cwd.value.split(sep).pop()!,
			msg,
		})
	}

	protected async handleCdCommand(command: string) {
		const path = command.substring(3)
		const prevCwd = this.cwd.value

		if (await isAbsolute(path)) {
			this.cwd.value = path
		} else {
			this.cwd.value = await join(this.cwd.value, path)
		}

		// Confirm that the path exists
		if (!(await exists(this.cwd.value))) {
			this.cwd.value = prevCwd
			this.addToOutput(`cd: no such directory`, 'stderr')
		}

		// Ensure that cwd doesn't leave the baseCwd
		if (!this.cwd.value.startsWith(this.baseCwd)) {
			this.cwd.value = prevCwd
			this.addToOutput(`cd: Permission denied`, 'stderr')
		}
	}

	async executeCommand(command: string) {
		this.addToOutput(command, 'stdin')

		if (command.startsWith('cd ')) {
			await this.handleCdCommand(command)
			return
		}

		this.hasRunningTask.value = true

		await this.setupDone.fired

		await invoke<string>('execute_command', {
			cwd: this.cwd.value,
			command,
		})
	}

	async killCommand() {
		await invoke('kill_command')
	}
}

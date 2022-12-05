import { markRaw, ref } from 'vue'
import { invoke } from '@tauri-apps/api/tauri'
import { App } from '/@/App'
import { Signal } from '../Common/Event/Signal'
import { appLocalDataDir, isAbsolute, join } from '@tauri-apps/api/path'
import { exists } from '@tauri-apps/api/fs'
import './Terminal.css'

interface ICommand {
	// Format HH:MM:SS
	time: string
	command: string
	stdout: string[]
	stderr: string[]
}

export class Terminal {
	output = ref<ICommand[]>([])
	hasRunningTask = ref(false)
	baseCwd = ''
	cwd = ref('')
	setupDone = markRaw(new Signal<void>())

	constructor() {
		setTimeout(() => this.setup())
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

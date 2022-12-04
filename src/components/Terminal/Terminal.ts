import { SidebarContent } from '/@/components/Sidebar/Content/SidebarContent'
import { SidebarAction } from '/@/components/Sidebar/Content/SidebarAction'
import TerminalComponent from './Terminal.vue'
import { markRaw, ref } from 'vue'
import { InfoPanel } from '/@/components/InfoPanel/InfoPanel'
import { DirectoryWrapper } from '../UIElements/DirectoryViewer/DirectoryView/DirectoryWrapper'
import { invoke } from '@tauri-apps/api/tauri'
import { pathFromHandle } from '../FileSystem/Virtual/pathFromHandle'
import { App } from '/@/App'

interface ICommand {
	// Format HH:MM:SS
	time: string
	command: string
	output: string[]
}

export class Terminal extends SidebarContent {
	component = markRaw(TerminalComponent)
	actions: SidebarAction[] = []
	directoryEntries: Record<string, DirectoryWrapper> = {}
	topPanel: InfoPanel | undefined = undefined
	showNoProjectView = false
	headerHeight = '60px'
	output = ref<ICommand[]>([])

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
		const app = await App.getApp()
		const output = await invoke<string>('execute_command', {
			cwd: await pathFromHandle(app.project.baseDirectory),
			command,
		})

		this.output.value.unshift({
			time: new Date().toLocaleTimeString(),
			command,
			output: output.split('\n'),
		})
	}
}

import { proxy } from 'comlink'
import { Project } from '/@/components/Projects/Project/Project'
import { createSidebar } from '/@/components/Sidebar/create'
import { App } from '/@/App'

const saveState = new Map<string, ISidebarState>()
interface ISidebarState {
	projectName: string
	lastReadCount: number
	currentCount: number
}

export function createCompilerSidebar() {
	let state: ISidebarState = {
		projectName: '',
		lastReadCount: 0,
		currentCount: 0,
	}
	let selectedCategory: string | undefined = undefined
	let isWindowOpen = false

	const removeListeners = async () => {
		const app = await App.getApp()
		app.project.compilerService.removeConsoleListeners()
	}
	const listenForLogChanges = async (resetListeners = false) => {
		const app = await App.getApp()

		if (resetListeners) await removeListeners()

		app.project.compilerService.onConsoleUpdate(
			proxy(async () => {
				let logs = await app.project.compilerService.getCompilerLogs()
				logs = logs.filter(
					([_, { type }]) => type === 'error' || type === 'warning'
				)

				state.currentCount = logs.length

				// User currently still has logs tab selected and therefore sees the new logs
				if (isWindowOpen && selectedCategory === 'logs')
					state.lastReadCount = state.currentCount
				updateBadge()
			})
		)
	}
	const updateBadge = () => {
		sidebar.attachBadge({
			count: state.currentCount - state.lastReadCount,
			color: 'error',
		})
	}

	const sidebar = createSidebar({
		id: 'compiler',
		displayName: 'sidebar.compiler.name',
		icon: 'mdi-cogs',
		onClick: async () => {
			const app = await App.getApp()
			const compilerWindow = app.windows.compilerWindow

			const disposable = compilerWindow.activeCategoryChanged.on(
				(selected) => {
					selectedCategory = selected

					// User switched to logs tab and therefore saw all previously unread logs
					if (selected === 'logs') {
						state.lastReadCount = state.currentCount
						updateBadge()
					}
				}
			)

			/**
			 * We manually clear the signal here because that normally happens inside of the window.open() method
			 * which is triggered after the listener registration in this case
			 */
			compilerWindow.resetSignal()
			compilerWindow.once(() => {
				disposable.dispose()
				isWindowOpen = false
				listenForLogChanges()
			})

			isWindowOpen = true
			await compilerWindow.open()

			// User opened window and logs tab is still selected
			if (selectedCategory === 'logs') {
				state.lastReadCount = state.currentCount
				updateBadge()
			}
		},
	})

	App.eventSystem.on('projectChanged', async (project: Project) => {
		saveState.set(state.projectName, state)

		state = saveState.get(project.name) ?? {
			projectName: project.name,
			lastReadCount: 0,
			currentCount: 0,
		}
		updateBadge()

		await listenForLogChanges(true)
	})
}

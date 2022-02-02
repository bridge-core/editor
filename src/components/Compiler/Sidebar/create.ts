import { proxy } from 'comlink'
import { createSidebar } from '../../Sidebar/create'
import { App } from '/@/App'

export function createCompilerSidebar() {
	let lastReadCount = 0
	let currentCount = 0
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
				const logs = await app.project.compilerService.getCompilerLogs()

				currentCount = logs.length

				// User currently still has logs tab selected and therefore sees the new logs
				if (isWindowOpen && selectedCategory === 'logs')
					lastReadCount = currentCount
				updateBadge()
			})
		)
	}
	const updateBadge = () => {
		sidebar.attachBadge({
			count: currentCount - lastReadCount,
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
						lastReadCount = currentCount
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
				lastReadCount = currentCount
				updateBadge()
			}
		},
	})

	App.eventSystem.on('projectChanged', async () => {
		lastReadCount = 0

		await listenForLogChanges(true)
	})
}

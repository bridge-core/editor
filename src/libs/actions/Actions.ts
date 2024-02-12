import { fileSystem, tabManager } from '@/App'
import { Action } from './Action'
import { TextTab } from '@/components/Tabs/Text/TextTab'

export class Actions {
	private static actions: Record<string, Action> = {}

	public static addAction(action: Action) {
		this.actions[action.id] = action
	}

	public static trigger(id: string, data?: any) {
		if (this.actions[id] === undefined) return

		this.actions[id].trigger(data)
	}

	public static setup() {
		this.addAction(
			new Action({
				id: 'save',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.save()
				},
				keyBinding: 'Ctrl + S',
			})
		)

		this.addAction(
			new Action({
				id: 'copy',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.copy()
				},
				keyBinding: 'Ctrl + C',
			})
		)

		this.addAction(
			new Action({
				id: 'paste',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.paste()
				},
				keyBinding: 'Ctrl + V',
			})
		)

		this.addAction(
			new Action({
				id: 'cut',
				trigger: () => {
					const focusedTab = tabManager.getFocusedTab()

					if (focusedTab === null) return

					if (!(focusedTab instanceof TextTab)) return

					focusedTab.cut()
				},
				keyBinding: 'Ctrl + X',
			})
		)

		this.addAction(
			new Action({
				id: 'deleteFileSystemEntry',
				trigger: async (data: unknown) => {
					if (typeof data !== 'string') return

					if (!(await fileSystem.exists(data))) return

					const entry = await fileSystem.getEntry(data)

					if (entry.type === 'directory') {
						await fileSystem.removeDirectory(data)
					}

					if (entry.type === 'file') {
						await fileSystem.removeFile(data)
					}
				},
				keyBinding: 'Ctrl + X',
			})
		)
	}
}

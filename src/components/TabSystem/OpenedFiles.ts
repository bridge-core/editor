import { Signal } from '/@/components/Common/Event/Signal'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { App } from '/@/App'
import { PersistentQueue } from '/@/components/Common/PersistentQueue'
import { TabSystem } from '/@/components/TabSystem/TabSystem'

export class OpenedFiles extends PersistentQueue<string> {
	public readonly ready = new Signal<void>()

	constructor(tabSystem: TabSystem, app: App, savePath: string) {
		super(app, Infinity, savePath)

		if (settingsState?.general?.restoreTabs ?? true) {
			this.once(async (queue) => {
				for (let i = 0; i < queue.elements.length; i++) {
					try {
						// Try to restore tab
						await tabSystem.openPath(
							queue.elements[i],
							i + 1 === queue.elementCount
						)
					} catch {}
				}

				this.ready.dispatch()
			})
		}
	}
}

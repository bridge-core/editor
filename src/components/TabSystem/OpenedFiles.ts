import { Signal } from '/@/components/Common/Event/Signal'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { App } from '/@/App'
import { PersistentQueue } from '/@/components/Common/PersistentQueue'
import { TabSystem } from '/@/components/TabSystem/TabSystem'

export class OpenedFiles extends PersistentQueue<string> {
	constructor(protected tabSystem: TabSystem, app: App, savePath: string) {
		super(app, Infinity, savePath)
	}

	async restoreTabs() {
		if (settingsState?.general?.restoreTabs ?? true) {
			await this.fired

			for (let i = this.queue.elements.length - 1; i >= 0; i--) {
				try {
					// Try to restore tab
					await this.tabSystem.openPath(this.queue.elements[i], {
						selectTab: i === 0,
						isTemporary: false,
					})
				} catch {}
			}
		}
	}
}

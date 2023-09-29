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

			for (const file of this.queue.elements.reverse()) {
				try {
					// Try to restore tab
					await this.tabSystem.openPath(file, {
						selectTab: file == this.queue.elements[0],
						isTemporary: false,
					})
				} catch {}
			}
		}
	}
}

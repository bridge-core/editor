import '/@/components/Notifications/Errors'
import '/@/components/Languages/LanguageManager'

import Vue from 'vue'
import { EventSystem } from '/@/components/Common/Event/EventSystem'
import { Signal } from '/@/components/Common/Event/Signal'
import { createFileSystem } from './utils/fileSystem/FileSystem'
import { PWAFileSystem } from './utils/fileSystem/PWAFileSystem'

if (import.meta.env.VITE_IS_TAURI_APP) {
	// Import Tauri updater for native builds
	import('./components/App/Tauri/TauriUpdater')
} else {
	// Only import service worker for non-Tauri builds
	import('/@/components/App/ServiceWorker')
}

export class App {
	public static readonly eventSystem = new EventSystem<any>([
		'projectChanged',
		'currentTabSwitched',
		'refreshCurrentContext',
		'disableValidation',
		'fileAdded',
		'fileChange',
		'beforeFileSave',
		'fileSave',
		'fileUnlinked',
		'presetsChanged',
		'availableProjectsFileChanged',
		'beforeModifiedProject',
		'modifiedProject',
	])
	public static readonly ready = new Signal<App>()
	public static instance: Readonly<App>

	static async main(appComponent: Vue) {
		console.time('[APP] Ready')

		this.instance = new App()

		console.timeEnd('[APP] Ready')
	}
}

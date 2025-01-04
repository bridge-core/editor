import { Sidebar } from './Sidebar'
import { FileExplorer } from '@/components/FileExplorer/FileExplorer'
import { FindAndReplaceTab } from '@/components/Tabs/FindAnReplace/FindAndReplaceTab'
import { ExtensionLibraryWindow } from '@/components/Windows/ExtensionLibrary/ExtensionLibrary'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Windows } from '@/components/Windows/Windows'
import { CompilerWindow } from '@/components/Windows/Compiler/CompilerWindow'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { SocialsWindow } from '@/components/Windows/Socials/SocialsWindow'
import { openUrl } from '@/libs/OpenUrl'

export function setupSidebar() {
	Sidebar.addButton('fileExplorer', 'sidebar.fileExplorer.name', 'folder', () => {
		FileExplorer.toggle()
	})

	Sidebar.addButton('findAndReplace', 'sidebar.findAndReplace.name', 'quick_reference_all', () => {
		TabManager.openTab(TabManager.getTabByType(FindAndReplaceTab) ?? new FindAndReplaceTab())
	})

	Sidebar.addButton('compiler', 'sidebar.compiler.name', 'manufacturing', () => {
		Windows.open(CompilerWindow)
	})
	Sidebar.addButton('extensionLibrary', 'sidebar.extensions.name', 'extension', () => {
		ExtensionLibraryWindow.open()
	})
	Sidebar.addDivider()

	NotificationSystem.addNotification(
		'download',
		() => {
			openUrl('https://bridge-core.app/guide/download/')
		},
		'primary'
	)

	NotificationSystem.addNotification('link', () => {
		Windows.open(SocialsWindow)
	})

	NotificationSystem.addNotification('help', () => {
		openUrl('https://bridge-core.app/guide/')
	})
}

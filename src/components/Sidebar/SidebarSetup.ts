import { Sidebar } from './Sidebar'
import { FileExplorer } from '@/components/FileExplorer/FileExplorer'
import { FindAndReplaceTab } from '@/components/Tabs/FindAnReplace/FindAndReplaceTab'
import { ExtensionLibraryWindow } from '@/components/Windows/ExtensionLibrary/ExtensionLibrary'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Windows } from '@/components/Windows/Windows'
import { CompilerWindow } from '@/components/Windows/Compiler/CompilerWindow'

export function setupSidebar() {
	Sidebar.addButton('folder', () => {
		FileExplorer.toggle()
	})

	Sidebar.addButton('quick_reference_all', () => {
		TabManager.openTab(TabManager.getTabByType(FindAndReplaceTab) ?? new FindAndReplaceTab())
	})

	Sidebar.addButton('manufacturing', () => {
		Windows.open(CompilerWindow)
	})
	Sidebar.addButton('extension', () => {
		ExtensionLibraryWindow.open()
	})
	Sidebar.addDivider()

	Sidebar.addNotification(
		'download',
		() => {
			window.open('https://bridge-core.app/guide/download/')
		},
		'primary'
	)
	// Sidebar.addNotification('link', () => {}, 'warning') // Don't remember why I put this, maybe a social media thing?
	Sidebar.addNotification('help', () => {
		window.open('https://bridge-core.app/guide/')
	})
}

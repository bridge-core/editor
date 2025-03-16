import TextButton from '@/components/Common/TextButton.vue'
import LabeledInput from '@/components/Common/LabeledInput.vue'
import LabeledTextInput from '@/components/Common/LabeledTextInput.vue'
import LabeledDropdown from '@/components/Common/LabeledDropdown.vue'
import LabeledAutocompleteInput from '@/components/Common/LabeledAutocompleteInput.vue'
import InformativeToggle from '@/components/Common/InformativeToggle.vue'
import Icon from '@/components/Common/Icon.vue'
import IconButton from '@/components/Common/IconButton.vue'
import FreeContextMenu from '@/components/Common/FreeContextMenu.vue'
import Expandable from '@/components/Common/Expandable.vue'
import DropdownComponent from '@/components/Common/Dropdown.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import ContextMenu from '@/components/Common/ContextMenu.vue'
import Button from '@/components/Common/Button.vue'
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'
import ActionComponent from '@/components/Common/Action.vue'
import Info from '@/components/Common/Info.vue'
import Warning from '@/components/Common/Warning.vue'
import SubMenu from '@/components/Common/SubMenu.vue'
import Switch from '@/components/Common/Switch.vue'

import { Button as SidebarButton, Divider as SidebarDivider, Sidebar } from '@/components/Sidebar/Sidebar'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Tab } from '@/components/TabSystem/Tab'
import { appVersion } from '@/libs/app/AppEnv'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BaseEntry, StreamableLike } from '@/libs/fileSystem/BaseFileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { dirname, join, extname, basename, resolve, relative } from 'pathe'
import { del, get, set, keys } from 'idb-keyval'
import { FileTab } from '@/components/TabSystem/FileTab'
import { ThemeManager, ThemeSettings } from '@/libs/theme/ThemeManager'
import { Settings } from '@/libs/settings/Settings'
import { openUrl } from '@/libs/OpenUrl'
import { Windows } from '@/components/Windows/Windows'
import { AlertWindow } from '@/components/Windows/Alert/AlertWindow'
import { ConfirmWindow } from '@/components/Windows/Confirm/ConfirmWindow'
import { DropdownWindow } from '@/components/Windows/Dropdown/DropdownWindow'
import { InformedChoiceWindow } from '@/components/Windows/InformedChoice/InformedChoiceWindow'
import { PromptWindow } from '@/components/Windows/Prompt/PromptWindow'
import { ProgressWindow } from '@/components/Windows/Progress/ProgressWindow'
import { disposeAll, Disposable } from '@/libs/disposeable/Disposeable'
import { Extension } from './Extension'
import { Action } from '@/libs/actions/Action'
import { ActionManager } from '@/libs/actions/ActionManager'
import {
	Dropdown as ToolbarDropdown,
	DropdownItem as ToolbarDropdownItem,
	Button as ToolbarButton,
	Toolbar,
} from '@/components/Toolbar/Toolbar'
import { FileImporter } from '@/libs/import/FileImporter'
import { DirectoryImporter } from '@/libs/import/DirectoryImporter'
import { ImporterManager } from '@/libs/import/ImporterManager'
import { ExportActionManager } from '@/libs/actions/export/ExportActionManager'
import { TabTypes } from '@/components/TabSystem/TabTypes'
import { FileActionManager } from '@/libs/actions/file/FileActionManager'

import json5 from 'json5'
import * as fflate from 'fflate'
import * as three from 'three'
import * as vue from 'vue'

export function setupModules() {
	Extension.registerModule('@bridge/sidebar', (extension) => {
		let sidebarItems: (SidebarButton | SidebarDivider)[] = []

		extension.deactivated.once(() => {
			for (const item of sidebarItems) {
				Sidebar.remove(item)
			}

			sidebarItems = []
		})

		return {
			addSidebarButton(id: string, displayName: string, icon: string, action: string) {
				sidebarItems.push(
					Sidebar.addButton(id, displayName, icon, () => {
						ActionManager.trigger(action)
					})
				)
			},
			addSidebarDivider() {
				sidebarItems.push(Sidebar.addDivider())
			},
			addSidebarTabButton(id: string, displayName: string, icon: string, tab: Tab) {
				sidebarItems.push(
					Sidebar.addButton(id, displayName, icon, () => {
						TabManager.openTab(tab)
					})
				)
			},
		}
	})

	Extension.registerModule('@bridge/ui', () => ({
		TextButton,
		LabeledInput,
		LabeledTextInput,
		LabeledDropdown,
		LabeledAutocompleteInput,
		InformativeToggle,
		Icon,
		IconButton,
		FreeContextMenu,
		Expandable,
		Dropdown: DropdownComponent,
		ContextMenuItem,
		ContextMenu,
		Button,
		ActionContextMenuItem,
		Action: ActionComponent,
		Info,
		Warning,
		SubMenu,
		Switch,
	}))

	Extension.registerModule('@bridge/env', () => ({
		appVersion,
	}))

	Extension.registerModule('@bridge/project', (extension) => {
		let disposables: Disposable[] = []

		extension.deactivated.once(() => {
			disposeAll(disposables)

			disposables = []
		})

		return {
			getCurrentProject() {
				return ProjectManager.currentProject
			},
			getBPPath() {
				return ProjectManager.currentProject?.resolvePackPath('behaviorPack') ?? null
			},
			getRPPath() {
				return ProjectManager.currentProject?.resolvePackPath('resourcePack') ?? null
			},
			getNamespace() {
				return ProjectManager.currentProject?.config?.namespace ?? null
			},
			getTargetVersion() {
				return ProjectManager.currentProject?.config?.targetVersion ?? null
			},
			getAuthors() {
				return ProjectManager.currentProject?.config?.authors ?? null
			},
			resolvePackPath(packId: string, filePath: string) {
				return ProjectManager.currentProject?.resolvePackPath(packId, filePath) ?? null
			},
			hasPacks(packs: string[]) {
				if (!ProjectManager.currentProject) return false

				for (const pack of packs) {
					if (ProjectManager.currentProject.packs[pack] === undefined) return false
				}

				return true
			},
			onProjectChanged(callback: (projectName: string | null) => void) {
				disposables.push(
					ProjectManager.updatedCurrentProject.on(() => {
						callback(ProjectManager.currentProject?.name ?? null)
					})
				)
			},
		}
	})

	Extension.registerModule('@bridge/import', (extension) => {
		let registeredFileImporters: FileImporter[] = []
		let registeredDirectoryImporters: DirectoryImporter[] = []

		extension.deactivated.once(() => {
			for (const importer of Object.values(registeredFileImporters)) {
				ImporterManager.removeFileImporter(importer)
			}

			for (const importer of Object.values(registeredDirectoryImporters)) {
				ImporterManager.removeDirectoryImporter(importer)
			}

			registeredFileImporters = []
			registeredDirectoryImporters = []
		})

		return {
			FileImporter,
			DirectoryImporter,
			addFileImporter(importer: FileImporter) {
				registeredFileImporters.push(importer)

				ImporterManager.addFileImporter(importer)
			},
			addDirectoryImporter(importer: DirectoryImporter) {
				registeredDirectoryImporters.push(importer)

				ImporterManager.addDirectoryImporter(importer)
			},
		}
	})

	Extension.registerModule('@bridge/export', (extension) => {
		let registeredExportActions: string[] = []

		extension.deactivated.once(() => {
			for (const exportAction of registeredExportActions) {
				ExportActionManager.removeAction(exportAction)
			}

			registeredExportActions = []
		})

		return {
			addExportAction(action: string) {
				registeredExportActions.push(action)

				ExportActionManager.addAction(action)
			},
			removeExportAction(action: string) {
				registeredExportActions.splice(registeredExportActions.indexOf(action))

				ExportActionManager.removeAction(action)
			},
		}
	})

	Extension.registerModule('@bridge/fileAction', (extension) => {
		let registeredFileActions: string[] = []

		extension.deactivated.once(() => {
			for (const action of registeredFileActions) {
				FileActionManager.removeAction(action)
			}

			registeredFileActions = []
		})

		return {
			addFileAction(action: string, fileTypes: string[]) {
				registeredFileActions.push(action)

				FileActionManager.addAction(action, fileTypes)
			},
			removeFileAction(action: string, fileTypes: string[]) {
				registeredFileActions.splice(registeredFileActions.indexOf(action))

				FileActionManager.removeAction(action)
			},
		}
	})

	Extension.registerModule('@bridge/compiler', () => ({
		async compile() {
			if (ProjectManager.currentProject instanceof BedrockProject) await ProjectManager.currentProject.build()
		},
		async compileFiles(paths: string[]) {
			if (ProjectManager.currentProject instanceof BedrockProject) await ProjectManager.currentProject.dashService.compileFiles(paths)
		},
	}))

	Extension.registerModule('@bridge/com-mojang', () => ({
		async readFile(path: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			return await ProjectManager.currentProject.outputFileSystem.readFile(path)
		},
		async readFileText(path: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			return await ProjectManager.currentProject.outputFileSystem.readFileText(path)
		},
		async readFileDataUrl(path: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			return await ProjectManager.currentProject.outputFileSystem.readFileDataUrl(path)
		},
		async readFileJson(path: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			return await ProjectManager.currentProject.outputFileSystem.readFileJson(path)
		},
		async writeFile(path: string, content: FileSystemWriteChunkType) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			return await ProjectManager.currentProject.outputFileSystem.writeFile(path, content)
		},
		async writeFileJson(path: string, content: object, prettify: boolean) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			await ProjectManager.currentProject.outputFileSystem.writeFileJson(path, content, prettify)
		},
		async writeFileStreaming(path: string, stream: StreamableLike) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			await ProjectManager.currentProject.outputFileSystem.writeFileStreaming(path, stream)
		},
		async removeFile(path: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			await ProjectManager.currentProject.outputFileSystem.removeFile(path)
		},
		async copyFile(path: string, newPath: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			await ProjectManager.currentProject.outputFileSystem.copyFile(path, newPath)
		},
		async readDirectoryEntries(path: string): Promise<BaseEntry[]> {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			return await ProjectManager.currentProject.outputFileSystem.readDirectoryEntries(path)
		},
		async getEntry(path: string): Promise<BaseEntry> {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			return await ProjectManager.currentProject.outputFileSystem.getEntry(path)
		},
		async ensureDirectory(path: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			await ProjectManager.currentProject.outputFileSystem.ensureDirectory(path)
		},
		async makeDirectory(path: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			await ProjectManager.currentProject.outputFileSystem.makeDirectory(path)
		},
		async removeDirectory(path: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			await ProjectManager.currentProject.outputFileSystem.removeDirectory(path)
		},
		async move(path: string, newPath: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			await ProjectManager.currentProject.outputFileSystem.move(path, newPath)
		},
		async copyDirectory(path: string, newPath: string) {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			await ProjectManager.currentProject.outputFileSystem.move(path, newPath)
		},
		async exists(path: string): Promise<boolean> {
			if (!ProjectManager.currentProject) throw new Error('Can not access output filesystem. No project has been loaded yet!')

			return await ProjectManager.currentProject.outputFileSystem.exists(path)
		},
	}))

	Extension.registerModule('@bridge/fs', (extension) => {
		let disposables: Disposable[] = []

		extension.deactivated.once(() => {
			disposeAll(disposables)

			disposables = []
		})

		return {
			readFile: fileSystem.readFile.bind(fileSystem),
			readFileText: fileSystem.readFileText.bind(fileSystem),
			readFileDataUrl: fileSystem.readFileDataUrl.bind(fileSystem),
			readFileJson: fileSystem.readFileJson.bind(fileSystem),
			writeFile: fileSystem.writeFile.bind(fileSystem),
			writeFileJson: fileSystem.writeFileJson.bind(fileSystem),
			writeFileStreaming: fileSystem.writeFileStreaming.bind(fileSystem),
			removeFile: fileSystem.removeFile.bind(fileSystem),
			copyFile: fileSystem.copyFile.bind(fileSystem),
			readDirectoryEntries: fileSystem.readDirectoryEntries.bind(fileSystem),
			getEntry: fileSystem.getEntry.bind(fileSystem),
			ensureDirectory: fileSystem.ensureDirectory.bind(fileSystem),
			makeDirectory: fileSystem.makeDirectory.bind(fileSystem),
			removeDirectory: fileSystem.removeDirectory.bind(fileSystem),
			move: fileSystem.move.bind(fileSystem),
			copyDirectory: fileSystem.copyDirectory.bind(fileSystem),
			exists: fileSystem.exists.bind(fileSystem),
			onPathUpdated(callback: (path: string) => void) {
				disposables.push(
					fileSystem.pathUpdated.on((path) => {
						callback(path!)
					})
				)
			},
		}
	})

	Extension.registerModule('@bridge/indexer', () => ({
		getCachedData(fileType: string, filePath?: string, cacheKey?: string) {
			if (!ProjectManager.currentProject) return null
			if (!(ProjectManager.currentProject instanceof BedrockProject)) return null

			ProjectManager.currentProject.indexerService.getCachedData(fileType, filePath, cacheKey)
		},
		getIndexedFiles() {
			if (!ProjectManager.currentProject) return null
			if (!(ProjectManager.currentProject instanceof BedrockProject)) return null

			ProjectManager.currentProject.indexerService.getIndexedFiles()
		},
	}))

	Extension.registerModule('@bridge/json5', () => ({
		parse: (str: string) => json5.parse(str),
		stringify: (obj: any, replacer?: ((this: any, key: string, value: any) => any) | undefined, space?: string | number | undefined) =>
			JSON.stringify(obj, replacer, space),
	}))

	Extension.registerModule('@bridge/notification', () => ({
		addNotification: NotificationSystem.addNotification,
		addProgressNotification: NotificationSystem.addProgressNotification,
		clearNotifications: NotificationSystem.clearNotification,
		setProgress: NotificationSystem.setProgress,
		activateNotification: NotificationSystem.activateNotification,
	}))

	Extension.registerModule('@bridge/path', () => ({
		dirname,
		join,
		extname,
		basename,
		resolve,
		relative,
	}))

	Extension.registerModule('@bridge/persistent-storage', () => ({
		save: set,
		load: get,
		delete: del,
		has: async (key: string) => {
			return (await keys()).includes(key)
		},
	}))

	Extension.registerModule('@bridge/tab', (extension) => {
		let registeredTabTypes: (typeof Tab | typeof FileTab)[] = []
		let registeredFileTabTypes: (typeof FileTab)[] = []

		extension.deactivated.once(() => {
			for (const tabType of registeredTabTypes) {
				TabTypes.removeTabType(tabType)
			}

			for (const tabType of registeredFileTabTypes) {
				TabTypes.removeFileTabType(tabType)
			}

			registeredTabTypes = []
			registeredFileTabTypes = []
		})

		return {
			Tab,
			FileTab,
			openFile: TabManager.openFile,
			openTab: TabManager.openTab,
			registerTabType(tabType: typeof Tab | typeof FileTab) {
				registeredTabTypes.push(tabType)

				TabTypes.addTabType(tabType)
			},
			registerFileTabType(tabType: typeof FileTab) {
				registeredFileTabTypes.push(tabType)

				TabTypes.addFileTabType(tabType)
			},
			getFocusedTabSystem() {
				return TabManager.focusedTabSystem.value
			},
			getTabSystems() {
				return TabManager.tabSystems.value
			},
		}
	})

	Extension.registerModule('@bridge/theme', (extension) => {
		let disposables: Disposable[] = []

		extension.deactivated.once(() => {
			disposeAll(disposables)

			disposables = []
		})

		return {
			getColor(id: string) {
				return ThemeManager.get(ThemeManager.currentTheme).colors[id]
			},
			getCurrentTheme() {
				return ThemeManager.get(ThemeManager.currentTheme)
			},
			getCurrentMode() {
				const colorScheme = Settings.get(ThemeSettings.ColorScheme)

				if (colorScheme === 'light' || (colorScheme === 'auto' && !ThemeManager.prefersDarkMode())) return 'light'

				return 'dark'
			},
			onThemeChanged(callback: () => void) {
				disposables.push(
					ThemeManager.themeChanged.on(() => {
						callback()
					})
				)
			},
		}
	})

	Extension.registerModule('@bridge/action', (extension) => {
		let registeredActions: Record<string, Action> = {}

		extension.deactivated.once(() => {
			for (const action of Object.values(registeredActions)) {
				ActionManager.removeAction(action)

				delete registeredActions[action.id]
			}

			registeredActions = {}
		})

		return {
			Action,
			actions: ActionManager.actions,
			addAction(action: Action) {
				ActionManager.addAction(action)

				registeredActions[action.id] = action
			},
			removeAction(action: Action) {
				if (!registeredActions[action.id]) throw new Error('You can not remove an acton you have not registered!')

				ActionManager.removeAction(action)

				delete registeredActions[action.id]
			},
			trigger(action: string, data: any) {
				ActionManager.trigger(action, data)
			},
		}
	})

	Extension.registerModule('@bridge/toolbar', (extension) => {
		let addedDropdowns: ToolbarDropdown[] = []
		let addedButtons: ToolbarButton[] = []
		let addedDropdownItems: { dropdown: string; item: ToolbarDropdownItem }[] = []

		extension.deactivated.once(() => {
			for (const dropdown of addedDropdowns) {
				Toolbar.removeDropdown(dropdown)
			}

			addedDropdowns = []

			for (const button of addedButtons) {
				Toolbar.removeButton(button)
			}

			addedButtons = []

			for (const dropdownItem of addedDropdownItems) {
				Toolbar.removeDropdownItem(dropdownItem.dropdown, dropdownItem.item)
			}

			addedDropdownItems = []
		})

		return {
			addToolbarDropdown(id: string, name: string, items: ToolbarDropdownItem[]) {
				const dropdown = Toolbar.addDropdown(id, name, items)

				addedDropdowns.push(dropdown)
			},
			addToolbarDropdownItem(dropdown: string, item: ToolbarDropdownItem) {
				Toolbar.addDropdownItem(dropdown, item)

				addedDropdownItems.push({ dropdown, item })
			},
			addToolbarButton(action: string) {
				const button = Toolbar.addButton(action)

				addedButtons.push(button)
			},
		}
	})

	Extension.registerModule('@bridge/utils', () => ({
		openUrl,
	}))

	Extension.registerModule('@bridge/windows', () => ({
		AlertWindow,
		ConfirmWindow,
		DropdownWindow,
		InformedChoiceWindow,
		PromptWindow,
		ProgressWindow,
		open: Windows.open,
		close: Windows.close,
		isOpen: Windows.isOpen,
	}))

	Extension.registerModule('@bridge/globals', () => ({
		getGlobals() {
			if (!ProjectManager.currentProject) return

			return ProjectManager.currentProject.globals
		},
		getGlobalValue(item: string) {
			if (!ProjectManager.currentProject) return

			if (!ProjectManager.currentProject.globals) return

			return ProjectManager.currentProject.globals[item]
		},
	}))

	Extension.registerModule('@bridge/fflate', () => fflate)

	Extension.registerModule('@bridge/three', () => three)

	Extension.registerModule('@bridge/vue', () => vue)
}

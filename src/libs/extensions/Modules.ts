import { Sidebar } from '@/components/Sidebar/Sidebar'
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
import json5 from 'json5'
import * as fflate from 'fflate'
import * as three from 'three'
import { Windows } from '@/components/Windows/Windows'
import { AlertWindow } from '@/components/Windows/Alert/AlertWindow'
import { ConfirmWindow } from '@/components/Windows/Confirm/ConfirmWindow'
import { DropdownWindow } from '@/components/Windows/Dropdown/DropdownWindow'
import { InformedChoiceWindow } from '@/components/Windows/InformedChoice/InformedChoiceWindow'
import { PromptWindow } from '@/components/Windows/Prompt/PromptWindow'
import { ProgressWindow } from '@/components/Windows/Progress/ProgressWindow'
import { disposeAll, Disposable } from '@/libs/disposeable/Disposeable'
import { Extension } from './Extension'

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
import Dropdown from '@/components/Common/Dropdown.vue'
import ContextMenuItem from '@/components/Common/ContextMenuItem.vue'
import ContextMenu from '@/components/Common/ContextMenu.vue'
import Button from '@/components/Common/Button.vue'
import ActionContextMenuItem from '@/components/Common/ActionContextMenuItem.vue'
import ActionComponent from '@/components/Common/Action.vue'
import Info from '@/components/Common/Info.vue'
import Warning from '@/components/Common/Warning.vue'
import SubMenu from '@/components/Common/SubMenu.vue'
import Switch from '@/components/Common/Switch.vue'
import { Action } from '@/libs/actions/Action'
import { ActionManager } from '../actions/ActionManager'

export function setupModules() {
	Extension.registerModule('@bridge/sidebar', () => ({
		addSidebarTabButton(id: string, displayName: string, icon: string, component: any) {
			Sidebar.addButton(id, displayName, icon, () => {
				const tab = new Tab()
				tab.component = component
				tab.name.value = displayName
				tab.icon.value = icon

				TabManager.openTab(tab)
			})
		},
		addSidebarButton(id: string, displayName: string, icon: string, callback: () => void) {
			Sidebar.addButton(id, displayName, icon, callback)
		},
		addSidebarDivider() {
			Sidebar.addDivider()
		},
	}))

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
		Dropdown,
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

		disposables.push(
			extension.deactivated.on(() => {
				disposeAll(disposables)

				disposables = []
			})
		)

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
			registerExporter() {
				// TODO
			},
			async compile() {
				if (ProjectManager.currentProject instanceof BedrockProject) await ProjectManager.currentProject.build()
			},
			async compileFiles() {
				// TODO
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

		disposables.push(
			extension.deactivated.on(() => {
				disposeAll(disposables)

				disposables = []
			})
		)

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
		stringify: (obj: any, replacer?: ((this: any, key: string, value: any) => any) | undefined, space?: string | number | undefined) => JSON.stringify(obj, replacer, space),
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

	Extension.registerModule('@bridge/tab', () => ({
		Tab,
		FileTab,
		openFile: TabManager.openFile,
		openTab: TabManager.openTab,
		registerTabType(tabType: typeof Tab) {
			// TODO
		},
		getFocusedTabSystem() {
			return TabManager.focusedTabSystem.value
		},
		getTabSystems() {
			return TabManager.tabSystems.value
		},
	}))

	Extension.registerModule('@bridge/theme', (extension) => {
		let disposables: Disposable[] = []

		disposables.push(
			extension.deactivated.on(() => {
				disposeAll(disposables)

				disposables = []
			})
		)

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

	Extension.registerModule('@bridge/action', () => {
		let registeredActions: Record<string, Action> = {}

		return {
			Action,
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

	Extension.registerModule('@bridge/toolbar', () => ({
		addCategory() {
			// TODO
		},
		addAction() {
			// TODO
		},
	}))

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

	Extension.registerModule('@bridge/fflate', () => fflate)

	Extension.registerModule('@bridge/three', () => three)
}

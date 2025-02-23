import { Sidebar } from '@/components/Sidebar/Sidebar'
import { Extensions } from './Extensions'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Tab } from '@/components/TabSystem/Tab'
import { appVersion, isNightly } from '@/libs/app/AppEnv'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BaseEntry, StreamableLike } from '@/libs/fileSystem/BaseFileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { parse } from 'json5'
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { dirname, join, extname, basename, resolve, relative } from 'pathe'
import { del, get, set, keys } from 'idb-keyval'
import { FileTab } from '@/components/TabSystem/FileTab'
import { ThemeManager, ThemeSettings } from '@/libs/theme/ThemeManager'
import { Settings } from '@/libs/settings/Settings'

export function setupModules() {
	Extensions.registerModule('@bridge/sidebar', () => ({
		addTabButton(id: string, displayName: string, icon: string, component: any) {
			Sidebar.addButton(id, displayName, icon, () => {
				const tab = new Tab()
				tab.component = component
				tab.name.value = displayName
				tab.icon.value = icon

				TabManager.openTab(tab)
			})
		},
		addButton(id: string, displayName: string, icon: string, component: any, callback: () => void) {
			Sidebar.addButton(id, displayName, icon, callback)
		},
		addDivider() {
			Sidebar.addDivider()
		},
	}))

	Extensions.registerModule('@bridge/ui', () => {
		return {
			...Extensions.ui,
			BuiltIn: {},
		}
	})

	Extensions.registerModule('@bridge/env', () => ({
		appVersion,
		isNightly,
	}))

	Extensions.registerModule('@bridge/project', () => ({
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
		onProjectChanged() {
			// TODO
		},
	}))

	Extensions.registerModule('@bridge/com-mojang', () => ({
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

	Extensions.registerModule('@bridge/fs', () => ({
		readFile: fileSystem.readFile,
		readFileText: fileSystem.readFileText,
		readFileDataUrl: fileSystem.readFileDataUrl,
		readFileJson: fileSystem.readFileJson,
		writeFile: fileSystem.writeFile,
		writeFileJson: fileSystem.writeFileJson,
		writeFileStreaming: fileSystem.writeFileStreaming,
		removeFile: fileSystem.removeFile,
		copyFile: fileSystem.copyFile,
		readDirectoryEntries: fileSystem.readDirectoryEntries,
		getEntry: fileSystem.getEntry,
		ensureDirectory: fileSystem.ensureDirectory,
		makeDirectory: fileSystem.makeDirectory,
		removeDirectory: fileSystem.removeDirectory,
		move: fileSystem.move,
		copyDirectory: fileSystem.copyDirectory,
		exists: fileSystem.exists,
	}))

	Extensions.registerModule('@bridge/indexer', () => ({
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

	Extensions.registerModule('@bridge/fflate', () => import('fflate'))

	Extensions.registerModule('@bridge/json5', () => ({
		parse: (str: string) => parse(str),
		stringify: (obj: any, replacer?: ((this: any, key: string, value: any) => any) | undefined, space?: string | number | undefined) => JSON.stringify(obj, replacer, space),
	}))

	Extensions.registerModule('@bridge/notification', () => ({
		addNotification: NotificationSystem.addNotification,
		addProgressNotification: NotificationSystem.addProgressNotification,
		clearNotifications: NotificationSystem.clearNotification,
		setProgress: NotificationSystem.setProgress,
		activateNotification: NotificationSystem.activateNotification,
	}))

	Extensions.registerModule('@bridge/path', () => ({
		dirname,
		join,
		extname,
		basename,
		resolve,
		relative,
	}))

	Extensions.registerModule('@bridge/persistent-storage', () => ({
		save: set,
		load: get,
		delete: del,
		has: async (key: string) => {
			return (await keys()).includes(key)
		},
	}))

	Extensions.registerModule('@bridge/tab', () => ({
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

	Extensions.registerModule('@bridge/theme', () => ({
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
		onThemeChanged() {
			// TODO
		},
	}))
}

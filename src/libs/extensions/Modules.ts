import { Sidebar } from '@/components/Sidebar/Sidebar'
import { Extensions } from './Extensions'
import { TabManager } from '@/components/TabSystem/TabManager'
import { Tab } from '@/components/TabSystem/Tab'
import { appVersion, isNightly } from '@/libs/app/AppEnv'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BaseEntry, StreamableLike } from '@/libs/fileSystem/BaseFileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'

export function setupModules() {
	Extensions.registerModule('@bridge/sidebar', () => ({
		create: function (item: { id: string; displayName: string; icon: string; component: any }) {
			Sidebar.addButton(item.id, item.displayName, item.icon, () => {
				const tab = new Tab()
				tab.component = item.component
				tab.name.value = item.displayName
				tab.icon.value = item.icon

				TabManager.openTab(tab)
			})
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
	Extensions.registerModule('@bridge/json5', () => import('json5'))
}

// @ts-ignore Make "path" work on this worker
globalThis.process = {
	cwd: () => '',
	env: {},
	release: {
		name: 'browser',
	},
}

import '/@/components/FileSystem/Virtual/Comlink'
import { expose } from 'comlink'
import { FileSystem } from '../../FileSystem/FileSystem'
import { iterateDir } from '/@/utils/iterateDir'
import { extname, join, relative } from '/@/utils/path'

import { createRegExp, processFileText } from '../Utils'
import { AnyDirectoryHandle, AnyFileHandle } from '../../FileSystem/Types'
import { ProjectConfig } from '../../Projects/Project/Config'

export interface IQueryOptions {
	searchType: number
	isReadOnly?: boolean
}
export interface IDirectory {
	directory: AnyDirectoryHandle
	path: string
}
export interface IQueryResult {
	fileHandle: AnyFileHandle
	filePath: string
	displayFilePath: string
	matches: IMatch[]
}
export interface IMatch {
	isStartOfFile: boolean
	beforeMatch: string
	match: string
	afterMatch: string
}

const knownTextFiles = new Set([
	'.js',
	'.ts',
	'.lang',
	'.mcfunction',
	'.txt',
	'.md',
	'.molang',
	'.json',
	'.html',
])
const ignoreFolders = new Set(['.bridge', 'builds', '.git s'])
const textPreviewLength = 100

export class FindAndReplace {
	protected fileSystem: FileSystem
	protected matchedFiles = new Set<string>()
	protected config: ProjectConfig

	constructor(
		protected projectFolderHandle: AnyDirectoryHandle,
		protected projectPath: string
	) {
		this.fileSystem = new FileSystem(projectFolderHandle)
		this.config = new ProjectConfig(this.fileSystem, projectPath)
	}

	setMatchedFiles(matchedFiles: string[]) {
		const oldFiles = this.matchedFiles
		this.matchedFiles = new Set(matchedFiles)

		return [...oldFiles]
	}

	async createQuery(
		directories: IDirectory[],
		searchFor: string,
		{ searchType }: IQueryOptions
	) {
		this.matchedFiles.clear()

		if (searchFor === '') return []

		const queryResults: IQueryResult[] = []
		const regExp = createRegExp(searchFor, searchType)
		if (!regExp) return []

		const promises = []
		for (const directory of directories) {
			promises.push(
				this.iterateDirectory(directory, regExp, queryResults)
			)
		}
		await Promise.all(promises)

		return queryResults
	}

	async executeQuery(
		directories: IDirectory[],
		searchFor: string,
		replaceWith: string,
		{ searchType }: IQueryOptions
	) {
		if (searchFor === '') return []

		const regExp = createRegExp(searchFor, searchType)
		if (!regExp) return []

		const promises = []
		for (const directory of directories) {
			promises.push(this.replaceAll(directory, regExp, replaceWith))
		}
		await Promise.all(promises)
	}

	protected async iterateDirectory(
		{ directory, path }: IDirectory,
		regExp: RegExp,
		queryResults: IQueryResult[]
	) {
		await iterateDir(
			directory,
			async (fileHandle, filePath) => {
				const ext = extname(filePath)
				if (!knownTextFiles.has(ext)) return

				const matches: IMatch[] = []
				const fileText = await fileHandle
					.getFile()
					.then((file) => file.text())

				regExp.lastIndex = 0

				let currentMatch = regExp.exec(fileText)
				while (currentMatch !== null) {
					let beforeMatchStart =
						currentMatch.index - textPreviewLength / 2
					let beforeMatchLength = textPreviewLength / 2
					if (beforeMatchStart < 0) {
						beforeMatchLength = beforeMatchLength + beforeMatchStart
						beforeMatchStart = 0
					}

					matches.push({
						isStartOfFile: beforeMatchStart === 0,
						beforeMatch: fileText.substr(
							beforeMatchStart,
							beforeMatchLength
						),
						match: currentMatch[0],
						afterMatch: fileText.substr(
							currentMatch.index + currentMatch[0].length,
							textPreviewLength / 2
						),
					})
					currentMatch = regExp.exec(fileText)
				}

				if (matches.length > 0) {
					this.matchedFiles.add(filePath)
					queryResults.push({
						filePath,
						displayFilePath: join(
							`./${directory.name}`,
							relative(path, filePath)
						),
						fileHandle,
						matches,
					})
				}
			},
			ignoreFolders,
			path
		)
	}

	protected async replaceAll(
		{ directory, path }: IDirectory,
		regExp: RegExp,
		replaceWith: string
	) {
		await iterateDir(
			directory,
			async (fileHandle, filePath) => {
				const ext = extname(filePath)
				if (
					!knownTextFiles.has(ext) ||
					!this.matchedFiles.has(filePath)
				)
					return

				const fileText = await fileHandle
					.getFile()
					.then((file) => file.text())

				const newFileText = processFileText(
					fileText,
					regExp,
					replaceWith
				)

				if (fileText !== newFileText)
					await this.fileSystem.write(fileHandle, newFileText)
			},
			ignoreFolders,
			path
		)
	}
}

expose(FindAndReplace)

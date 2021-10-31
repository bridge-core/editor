// @ts-ignore Make "path" work on this worker
globalThis.process = {
	cwd: () => '',
	env: {},
}

import '/@/components/FileSystem/Virtual/Comlink'
import { expose } from 'comlink'
import { FileSystem } from '../../FileSystem/FileSystem'
import { ESearchType } from '../Controls/SearchTypeEnum'
import { iterateDir } from '/@/utils/iterateDir'
import { extname, resolve } from '/@/utils/path'

import { createRegExp, processFileText } from '../Utils'
import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { isMatch } from '/@/utils/glob/isMatch'
import { ProjectConfig } from '../../Projects/Project/Config'
import { TPackTypeId } from '../../Data/PackType'

export interface IQueryOptions {
	searchType: ESearchType
	includeFiles: string
	excludeFiles: string
}
export interface IQueryResult {
	filePath: string
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

	constructor(protected projectFolderHandle: AnyDirectoryHandle) {
		this.fileSystem = new FileSystem(projectFolderHandle)
		this.config = new ProjectConfig(this.fileSystem)
	}

	setMatchedFiles(matchedFiles: string[]) {
		const oldFiles = this.matchedFiles
		this.matchedFiles = new Set(matchedFiles)

		return [...oldFiles]
	}

	protected matchFolder(path: string, include: string, exclude: string) {
		let matchesInclude: boolean | undefined =
			include.length === 0 ? true : undefined
		let matchesExclude: boolean | undefined =
			exclude.length === 0 ? true : undefined
		// Convert include/exclude to array
		let includePaths: string[] = include.replaceAll(' ', '').split(',')
		let excludePaths: string[] = exclude.replaceAll(' ', '').split(',')
		// Resolve pack path in the user input
		const packs: { [key: string]: TPackTypeId } = {
			BP: 'behaviorPack',
			RP: 'resourcePack',
			SP: 'skinPack',
			WT: 'worldTemplate',
		}
		for (const pack of Object.keys(packs)) {
			includePaths = includePaths.map((includePath) =>
				includePath.replace(
					pack,
					resolve(this.config.getPackRoot(packs[pack]))
				)
			)
			excludePaths = excludePaths.map((excludePath) =>
				excludePath.replace(
					pack,
					resolve(this.config.getPackRoot(packs[pack]))
				)
			)
		}
		// Check whether both conditions match or not
		const match = (path: string, toMatch: string) => {
			if (toMatch.includes('*')) return isMatch(path, toMatch)
			else return path.startsWith(toMatch)
		}
		matchesInclude ??= includePaths.some((includePath) =>
			match(path, includePath)
		)
		matchesExclude ??= !excludePaths.some((excludePath) =>
			match(path, excludePath)
		)

		return matchesInclude && matchesExclude
	}

	async createQuery(
		searchFor: string,
		{ searchType, includeFiles, excludeFiles }: IQueryOptions
	) {
		this.matchedFiles.clear()

		if (searchFor === '') return []

		const queryResults: IQueryResult[] = []
		const regExp = createRegExp(searchFor, searchType)
		if (!regExp) return []

		await this.iterateProject(
			regExp,
			queryResults,
			includeFiles,
			excludeFiles
		)

		return queryResults
	}

	async executeQuery(
		searchFor: string,
		replaceWith: string,
		{ searchType }: IQueryOptions
	) {
		if (searchFor === '') return []

		const regExp = createRegExp(searchFor, searchType)
		if (!regExp) return []

		await this.replaceAll(regExp, replaceWith)
	}

	protected async iterateProject(
		regExp: RegExp,
		queryResults: IQueryResult[],
		includeFiles: string,
		excludeFiles: string
	) {
		await iterateDir(
			this.projectFolderHandle,
			async (fileHandle, filePath) => {
				const ext = extname(filePath)
				if (
					!knownTextFiles.has(ext) ||
					!this.matchFolder(filePath, includeFiles, excludeFiles)
				)
					return

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
					queryResults.push({ filePath, matches })
				}
			},
			ignoreFolders
		)
	}

	protected async replaceAll(regExp: RegExp, replaceWith: string) {
		await iterateDir(
			this.projectFolderHandle,
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
			ignoreFolders
		)
	}
	protected async replaceInFile(regExp: RegExp, replaceWith: string) {}
}

expose(FindAndReplace)

import { expose } from 'comlink'
import { FileSystem } from '../../FileSystem/FileSystem'
import { ESearchType } from '../Controls/SearchTypeEnum'
import { iterateDir } from '/@/utils/iterateDir'
import { extname } from '/@/utils/path'

import { createRegExp, processFileText } from '../Utils'

export interface IQueryOptions {
	searchType: ESearchType
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
])
const ignoreFolders = new Set(['.bridge', 'builds'])
const textPreviewLength = 100

export class FindAndReplace {
	protected fileSystem: FileSystem
	protected matchedFiles = new Set<string>()
	constructor(protected projectFolderHandle: FileSystemDirectoryHandle) {
		this.fileSystem = new FileSystem(projectFolderHandle)
	}

	async createQuery(searchFor: string, { searchType }: IQueryOptions) {
		this.matchedFiles.clear()

		if (searchFor === '') return []

		const queryResults: IQueryResult[] = []
		const regExp = createRegExp(searchFor, searchType)
		if (!regExp) return []

		await this.iterateProject(regExp, queryResults)

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
		queryResults: IQueryResult[]
	) {
		await iterateDir(
			this.projectFolderHandle,
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

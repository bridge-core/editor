import { expose } from 'comlink'
import { FileSystem } from '../../FileSystem/FileSystem'
import { ESearchType } from '../Controls/SearchTypeEnum'
import { iterateDir } from '/@/utils/iterateDir'
import { extname } from '/@/utils/path'

export interface IQueryOptions {
	searchType: ESearchType
}
export interface IQueryResult {
	filePath: string
	matches: IMatch[]
}
export interface IMatch {
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
const textPreviewLength = 100

export class FindAndReplace {
	protected fileSystem: FileSystem
	constructor(protected projectFolderHandle: FileSystemDirectoryHandle) {
		this.fileSystem = new FileSystem(projectFolderHandle)
	}

	async createQuery(
		searchFor: string,
		replaceWith: string,
		{ searchType }: IQueryOptions
	) {
		if (searchFor === '') return []

		const queryResults: IQueryResult[] = []

		await iterateDir(
			this.projectFolderHandle,
			async (fileHandle, filePath) => {
				const ext = extname(filePath)
				if (!knownTextFiles.has(ext)) return

				const matches: IMatch[] = []
				const fileText = await fileHandle
					.getFile()
					.then((file) => file.text())

				const regExp = new RegExp(
					searchFor,
					`g${searchType === ESearchType.ignoreCase ? 'i' : ''}`
				)

				let currentMatch = regExp.exec(fileText)
				while (currentMatch !== null) {
					matches.push({
						beforeMatch: fileText.substr(
							currentMatch.index - textPreviewLength / 2,
							textPreviewLength / 2
						),
						match: currentMatch[0],
						afterMatch: fileText.substr(
							currentMatch.index + currentMatch[0].length,
							textPreviewLength / 2
						),
					})
					currentMatch = regExp.exec(fileText)
				}

				if (matches.length > 0) queryResults.push({ filePath, matches })
			},
			new Set(['.bridge', 'builds'])
		)

		return queryResults
	}
}

expose(FindAndReplace)

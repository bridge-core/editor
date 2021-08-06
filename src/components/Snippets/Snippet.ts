import { isMatch } from 'micromatch'

export interface ISnippet {
	name: string
	description?: string
	fileTypes: string[]
	locations?: string[]
	data: unknown
}

export class Snippet {
	protected name: string
	protected description: string | undefined
	protected fileTypes: Set<string>
	protected locations: string[]
	protected data: unknown

	constructor({ name, description, fileTypes, locations, data }: ISnippet) {
		this.name = name
		this.description = description
		this.fileTypes = new Set(fileTypes)
		this.locations = locations ?? []
		this.data = data
	}

	get displayData() {
		return {
			name: this.name,
			description: this.description,
		}
	}
	get insertData() {
		return this.data
	}
	get insertText() {
		return JSON.stringify(this.insertData, null, '\t')
			.slice(1, -1)
			.replaceAll('\n\t', '\n')
			.trim()
	}

	isValid(fileType: string, locations: string[]) {
		return (
			this.fileTypes.has(fileType) &&
			(this.locations.length === 0 ||
				this.locations.some((locPattern) =>
					locations.some((locationInFile) =>
						isMatch(locationInFile, locPattern)
					)
				))
		)
	}
}

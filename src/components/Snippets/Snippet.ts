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
		// This is a hacky solution to a vuetify bug
		// Keeps the snippet searchable by name even though we just workaround
		// Vuetify's missing ability to respect the "item-text" prop on the combobox component
		// https://github.com/vuetifyjs/vuetify/issues/5479
		return [this.name, this.data]
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
					locations.some(
						(locationInFile) =>
							locPattern === locationInFile ||
							(locPattern !== ''
								? isMatch(locationInFile, locPattern)
								: false)
					)
				))
		)
	}
}

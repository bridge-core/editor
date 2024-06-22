import { isMatch, compareVersions } from 'bridge-common-utils'

export interface SnippetData {
	name: string
	targetFormatVersion?: {
		min?: string
		max?: string
	}
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
	protected minTargetFormatVersion?: string
	protected maxTargetFormatVersion?: string

	constructor({ name, description, fileTypes, locations, data, targetFormatVersion }: SnippetData) {
		this.name = name
		this.description = description
		this.fileTypes = new Set(fileTypes)
		this.locations = locations ?? []
		this.data = data
		this.minTargetFormatVersion = targetFormatVersion?.min
		this.maxTargetFormatVersion = targetFormatVersion?.max
	}

	get displayData() {
		return {
			name: this.name,
			description: this.description,
		}
	}
	get insertData() {
		// This is a hacky solution for a vuetify bug
		// Keeps the snippet searchable by name even though we just workaround
		// Vuetify's missing ability to respect the "item-text" prop on the combobox component
		// https://github.com/vuetifyjs/vuetify/issues/5479
		return [this.name, this.data]
	}
	get insertText() {
		if (typeof this.data === 'string') return <string>this.data
		else if (Array.isArray(this.data)) return this.data.join('\n')

		return JSON.stringify(this.data, null, '\t').slice(1, -1).replaceAll('\n\t', '\n').trim()
	}

	isValid(formatVersion: unknown, fileType: string, locations: string[]) {
		const formatVersionValid =
			typeof formatVersion !== 'string' || //Format version inside of file is a string
			((!this.minTargetFormatVersion || compareVersions(formatVersion, this.minTargetFormatVersion, '>=')) &&
				(!this.maxTargetFormatVersion || compareVersions(formatVersion, this.maxTargetFormatVersion, '<=')))

		return (
			formatVersionValid &&
			this.fileTypes.has(fileType) &&
			(this.locations.length === 0 ||
				this.locations.some((locPattern) =>
					locations.some(
						(locationInFile) =>
							locPattern === locationInFile ||
							(locPattern !== '' ? isMatch(locationInFile, locPattern) : false)
					)
				))
		)
	}
}

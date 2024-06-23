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
	public name: string
	public description: string | undefined

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

	public getInsertText() {
		if (typeof this.data === 'string') return <string>this.data
		else if (Array.isArray(this.data)) return this.data.join('\n')

		return JSON.stringify(this.data, null, '\t').slice(1, -1).replaceAll('\n\t', '\n').trim()
	}

	public isValid(formatVersion: unknown, fileType: string, locations: string[]) {
		const formatVersionValid =
			typeof formatVersion !== 'string' ||
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

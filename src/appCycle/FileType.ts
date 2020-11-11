import minimatch from 'minimatch'
import json5 from 'json5'

interface IFileType {
	id: string
	matcher: string | string[]
	schema: string
	packSpider: string
}

interface IMonacoSchemaArrayEntry {
	fileMatch?: string[]
	uri: string
	schema?: any
}

export namespace FileType {
	let fileTypes: IFileType[] = []

	export async function setup() {
		const jsonString = await fetch(
			'https://raw.githubusercontent.com/bridge-core/data/next/packages/data/fileDefinitions.json'
		).then(rawData => rawData.text())
		fileTypes = json5.parse(jsonString) as IFileType[]
	}

	export function get(filePath: string) {
		for (const fileType of fileTypes) {
			if (
				typeof fileType.matcher === 'string' &&
				minimatch(filePath, fileType.matcher)
			)
				return fileType

			for (const matcher of fileType.matcher)
				if (minimatch(filePath, matcher)) return fileType
		}
	}

	export function getId(filePath: string) {
		return get(filePath)?.id ?? 'unknown'
	}

	export function getMonacoSchemaArray(): IMonacoSchemaArrayEntry[] {
		return fileTypes
			.map(({ matcher, schema }) => ({
				fileMatch: Array.isArray(matcher) ? [...matcher] : [matcher],
				uri: schema,
			}))
			.flat()
	}
}

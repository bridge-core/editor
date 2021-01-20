import { isMatch } from 'micromatch'
import { FileSystem } from '@/components/FileSystem/Main'

/**
 * Describes the structure of a pack definition
 */
export interface IPackType {
	id: string
	matcher: string | string[]
	color: string
}

/**
 * Utilities around bridge.'s pack definitions
 */
export namespace PackType {
	let packTypes: IPackType[] = []

	export async function setup(fileSystem: FileSystem) {
		if (packTypes.length > 0) return

		packTypes = <IPackType[]>(
			await fileSystem.readJSON('data/packages/packDefinitions.json')
		)
	}

	/**
	 * Get the pack definition data for the given file path
	 * @param filePath file path to fetch pack definition for
	 */
	export function get(filePath: string) {
		for (const packType of packTypes) {
			if (
				typeof packType.matcher === 'string' &&
				isMatch(filePath, packType.matcher)
			)
				return packType

			for (const matcher of packType.matcher)
				if (isMatch(filePath, matcher)) return packType
		}
	}

	/**
	 * Get the pack type/pack definition id for the provided file path
	 * @param filePath file path to get the pack type of
	 */
	export function getId(filePath: string) {
		return get(filePath)?.id ?? 'unknown'
	}
}

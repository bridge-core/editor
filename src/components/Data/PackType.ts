import { v4 as uuid } from 'uuid'
import { Signal } from '../Common/Event/Signal'
import { DataLoader } from './DataLoader'
import { isMatch } from '/@/utils/glob/isMatch'

/**
 * Describes the structure of a pack definition
 */
export interface IPackType {
	id: TPackTypeId
	matcher: string | string[]
	color: string
	icon: string
	packPath: string
}
export type TPackTypeId =
	| 'behaviorPack'
	| 'resourcePack'
	| 'skinPack'
	| 'worldTemplate'

/**
 * Utilities around bridge.'s pack definitions
 */
export namespace PackType {
	let packTypes: IPackType[] = []
	let extensionPackTypes = new Map<string, IPackType>()
	export const ready = new Signal<void>()

	export function all() {
		return packTypes.concat([...extensionPackTypes.values()])
	}

	export async function setup(dataLoader: DataLoader) {
		if (packTypes.length > 0) return
		await dataLoader.fired

		packTypes = <IPackType[]>(
			await dataLoader.readJSON(
				'data/packages/minecraftBedrock/packDefinitions.json'
			)
		)
		ready.dispatch()
	}

	/**
	 * Get the pack definition data for the given file path relative to the bridge folder
	 * @param filePath file path to fetch pack definition for
	 */
	export function get(filePath: string) {
		for (const packType of all()) {
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
	 * Get the pack definition data for the given file path relative to the project root
	 * @param filePath file path to fetch pack definition for
	 */
	export function getWithRelativePath(filePath: string) {
		return get(`projects/bridge/${filePath}`)
	}

	export function getFromId(packId: string) {
		for (const packType of all()) {
			if (packType.id === packId) return packType
		}
	}

	/**
	 * Get the pack type/pack definition id for the provided file path
	 * @param filePath file path to get the pack type of
	 */
	export function getId(filePath: string) {
		return get(filePath)?.id ?? 'unknown'
	}

	export function addExtensionPackType(packType: IPackType) {
		const id = uuid()
		extensionPackTypes.set(id, packType)

		return {
			dispose: () => extensionPackTypes.delete(id),
		}
	}
}

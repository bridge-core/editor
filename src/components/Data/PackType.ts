import { Signal } from '../Common/Event/Signal'
import { DataLoader } from './DataLoader'
import {
	PackType as BasePackType,
	ProjectConfig,
	type IPackType,
} from 'mc-project-core'

export type { IPackType, TPackTypeId } from 'mc-project-core'

/**
 * Utilities around bridge.'s pack definitions
 */
export class PackTypeLibrary extends BasePackType<DataLoader> {
	public readonly ready = new Signal<void>()

	constructor(projectConfig?: ProjectConfig) {
		super(projectConfig)
	}

	async setup(dataLoader: DataLoader) {
		if (this.packTypes.length > 0) return
		await dataLoader.fired

		this.packTypes = <IPackType[]>(
			await dataLoader
				.readJSON('data/packages/minecraftBedrock/packDefinitions.json')
				.catch(() => [])
		)
		this.ready.dispatch()
	}
}

import { TPackTypeId } from 'mc-project-core'

export interface IManifestModule {
	type: 'data' | 'resources' | 'skin_pack' | 'world_template'
}

export function getPackId(modules: IManifestModule[]): TPackTypeId | undefined {
	for (const { type } of modules) {
		switch (type) {
			case 'data':
				return 'behaviorPack'
			case 'resources':
				return 'resourcePack'
			case 'skin_pack':
				return 'skinPack'
			case 'world_template':
				return 'worldTemplate'
		}
	}
}

import { IPackType } from 'mc-project-core'

export interface CreateProjectConfig {
	name: string
	description: string
	namespace: string
	author: string
	targetVersion: string
	icon: FileSystemWriteChunkType
	packs: IPackType[]
}

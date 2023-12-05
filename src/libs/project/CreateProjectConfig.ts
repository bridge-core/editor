export interface CreateProjectConfig {
	name: string
	description: string
	namespace: string
	author: string
	targetVersion: string
	icon: FileSystemWriteChunkType
	packs: string[]
	configurableFiles: string[]
	rpAsBpDependency: boolean
	bpAsRpDependency: boolean
	uuids: { [key: string]: string }
	experiments: string[]
}

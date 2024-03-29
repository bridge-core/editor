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
	uuids: Record<string, string>
	experiments: Record<string, boolean>
}

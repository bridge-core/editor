import { TPackTypeId } from '/@/components/Data/PackType'
import { findFileExtension } from '/@/components/FileSystem/FindFile'
import { ProjectConfig } from '/@/components/Projects/Project/Config'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

export function getCacheScriptEnv(
	value: string,
	ctx: { fileSystem: FileSystem; config: ProjectConfig }
) {
	return <const>{
		Bridge: {
			value,
			withExtension: (basePath: string, extensions: string[]) =>
				findFileExtension(ctx.fileSystem, basePath, extensions),
			resolvePackPath: (packId: TPackTypeId, filePath: string) =>
				ctx.config.resolvePackPath(packId, filePath),
		},
	}
}

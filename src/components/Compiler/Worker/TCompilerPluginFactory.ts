// This import is relative so the compiler types build correctly
import { ProjectConfig } from '/@/components/Projects/Project/Config'
import { DataLoader } from '../../Data/DataLoader'
import { FileTypeLibrary } from '../../Data/FileType'
import { FileSystem } from '../../FileSystem/FileSystem'
import { TCompilerPlugin } from './TCompilerPlugin'

export type TCompilerPluginFactory<
	T = {
		mode: 'dev' | 'build'
		isFileRequest: boolean
		restartDevServer: boolean
		[key: string]: any
	}
> = (context: {
	options: T
	fileSystem: FileSystem
	fileType: FileTypeLibrary
	dataLoader: DataLoader
	projectConfig: ProjectConfig
	outputFileSystem: FileSystem
	hasComMojangDirectory: boolean
	compileFiles: (files: string[]) => Promise<void>
	getAliases: (filePath: string) => string[]
	targetVersion: string
}) => Partial<TCompilerPlugin>

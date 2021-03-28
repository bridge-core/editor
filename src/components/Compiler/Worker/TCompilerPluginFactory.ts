// This import is relative so the compiler types build correctly
import { FileSystem } from '../../FileSystem/FileSystem'
import { TCompilerPlugin } from './TCompilerPlugin'

export type TCompilerPluginFactory<T = any> = (context: {
	options: T
	fileSystem: FileSystem
	compileFiles: (
		files: string[],
		errorOnReadFailure?: boolean
	) => Promise<void>
	getAliases: (filePath: string) => string[]
	targetVersion: string
}) => Partial<TCompilerPlugin>

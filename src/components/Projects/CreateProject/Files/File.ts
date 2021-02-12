import { FileSystem } from '@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '../CreateProject'

export abstract class CreateFile {
	abstract create(
		fs: FileSystem,
		projectOptions: ICreateProjectOptions
	): Promise<void> | void
}

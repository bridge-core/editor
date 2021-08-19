import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '../CreateProject'

export abstract class CreateFile {
	public abstract id: string
	public icon = 'mdi-file'
	public isActive = true
	public isConfigurable = true

	abstract create(
		fs: FileSystem,
		projectOptions: ICreateProjectOptions
	): Promise<any> | any
}

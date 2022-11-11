import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from './CreateFile'

export class CreateGitIgnore extends CreateFile {
	public readonly id = 'gitignore'

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeFile(
			`.gitignore`,
			`Desktop.ini    
.DS_Store 
!.bridge/
.bridge/*
!.bridge/compiler/
!.bridge/extensions
builds`
		)
	}
}

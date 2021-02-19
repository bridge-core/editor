import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '/@/components/Projects/CreateProject/Files/File'

export class CreateGitIgnore extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeFile(
			`.gitignore`,
			`Desktop.ini    
.DS_Store 
!bridge/
bridge/*
!bridge/compiler/
!bridge/plugins
!bridge/config.json
builds`
		)
	}
}

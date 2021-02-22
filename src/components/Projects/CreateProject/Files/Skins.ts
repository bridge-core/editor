import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '/@/components/Projects/CreateProject/Files/File'

export class CreateSkins extends CreateFile {
	create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		return fs.writeJSON(
			`SP/skins.json`,
			{
				geometry: 'skinpacks/skins.json',
				skins: [],
				serialize_name: createOptions.prefix,
				localization_name: createOptions.prefix,
			},
			true
		)
	}
}

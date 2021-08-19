import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateSkins extends CreateFile {
	public readonly id = 'skins'

	create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		return fs.writeJSON(
			`SP/skins.json`,
			{
				geometry: 'skinpacks/skins.json',
				skins: [],
				serialize_name: createOptions.namespace,
				localization_name: createOptions.namespace,
			},
			true
		)
	}
}

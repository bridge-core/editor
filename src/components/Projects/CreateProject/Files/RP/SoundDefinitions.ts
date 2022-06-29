import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateSoundDefintions extends CreateFile {
	public readonly id = 'soundDefinitions'

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.mkdir('RP/sounds', { recursive: true })
		await fs.writeJSON(
			`RP/sounds/sound_definitions.json`,
			{
				format_version: '1.14.0',
				sound_definitions: {},
			},
			true
		)
	}
}

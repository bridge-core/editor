import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateSoundDefintions extends CreateFile {
	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.mkdir('RP/sounds', { recursive: true })
		await fs.writeJSON(
			`RP/sounds/sound_definitions.json`,
			{
				sound_definitions: {},
			},
			true
		)
	}
}

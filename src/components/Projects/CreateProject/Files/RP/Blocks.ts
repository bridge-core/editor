import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { CreateFile } from '../CreateFile'

export class CreateBlocks extends CreateFile {
	public readonly id = 'blocks'

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.writeJSON(
			`RP/blocks.json`,
			{
				format_version: [1, 1, 0],
			},
			true
		)
	}
}

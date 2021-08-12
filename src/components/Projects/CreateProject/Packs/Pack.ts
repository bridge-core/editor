import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '../CreateProject'
import { CreateFile } from '../Files/CreateFile'

export type TPackType = 'BP' | 'RP' | 'SP' | 'WT' | '.bridge'

export abstract class CreatePack {
	protected abstract packPath: TPackType
	protected abstract createFiles: CreateFile[]

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.mkdir(this.packPath)
		for (const createFile of this.createFiles) {
			await createFile.create(fs, createOptions)
		}
	}
}

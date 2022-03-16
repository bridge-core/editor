import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '../CreateProject'
import { CreateFile } from '../Files/CreateFile'

export type TPackType = 'BP' | 'RP' | 'SP' | 'WT' | '.bridge' | 'worlds'

export abstract class CreatePack {
	protected abstract packPath: TPackType
	public abstract createFiles: CreateFile[]

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		await fs.mkdir(this.packPath)
		for (const createFile of this.createFiles) {
			if (!createFile.isActive) continue

			await createFile.create(fs, createOptions)
		}
	}
}

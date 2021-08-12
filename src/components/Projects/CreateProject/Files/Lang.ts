import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { TPackType } from '/@/components/Projects/CreateProject/Packs/Pack'
import { CreateFile } from './CreateFile'

export class CreateLang extends CreateFile {
	constructor(protected packPath: TPackType) {
		super()
	}

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		if (
			!(
				(this.packPath == 'BP' || this.packPath == 'SP') &&
				createOptions.useLangForManifest
			)
		) {
			await fs.mkdir(`${this.packPath}/texts`)
			await fs.writeFile(
				`${this.packPath}/texts/en_US.lang`,
				createOptions.useLangForManifest
					? ''
					: `pack.name=${createOptions.name} ${this.packPath}\npack.description=${createOptions.description}`
			)
			await fs.writeJSON(
				`${this.packPath}/texts/languages.json`,
				['en_US'],
				true
			)
		}
	}
}

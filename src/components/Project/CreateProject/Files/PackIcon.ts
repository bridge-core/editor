import { FileSystem } from '@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '@/components/Project/CreateProject/CreateProject'
import { TPackType } from '@/components/Project/CreateProject/Packs/Pack'
import { CreateFile } from '@/components/Project/CreateProject/Files/File'
import { App } from '@/App'

export class CreatePackIcon extends CreateFile {
	constructor(protected packPath: TPackType) {
		super()
	}

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		let icon = createOptions.icon
		if (!icon) {
			const app = await App.getApp()
			icon = await app.fileSystem.readFile(`data/packages/packIcon.png`)
		}

		await fs.writeFile(`${this.packPath}/pack_icon.png`, icon)
	}
}

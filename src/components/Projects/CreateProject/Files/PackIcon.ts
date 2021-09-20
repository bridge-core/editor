import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { TPackType } from '/@/components/Projects/CreateProject/Packs/Pack'
import { CreateFile } from './CreateFile'
import { App } from '/@/App'

export class CreatePackIcon extends CreateFile {
	public readonly id = 'packIcon'
	public isConfigurable = false

	constructor(protected packPath: TPackType) {
		super()
	}

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		let icon = createOptions.icon
		if (!icon) {
			const app = await App.getApp()
			await app.dataLoader.fired
			icon = await app.dataLoader.readFile(
				`data/packages/common/packIcon.png`
			)
		}

		await fs.writeFile(`${this.packPath}/pack_icon.png`, icon)
	}
}

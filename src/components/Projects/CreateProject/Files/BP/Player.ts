import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { CreateFile } from '../CreateFile'

export class CreatePlayer extends CreateFile {
	async create(fs: FileSystem) {
		const app = await App.getApp()
		await app.dataLoader.fired
		const defaultPlayer = await app.dataLoader.readJSON(
			'data/packages/minecraftBedrock/vanilla/player.json'
		)

		await fs.writeJSON('BP/entities/player.json', defaultPlayer, true)
		await fs.writeFile('BP/loot_tables/empty.json', '{}')
	}
}

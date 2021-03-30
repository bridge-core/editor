import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { CreateFile } from '../CreateFile'

export class CreatePlayer extends CreateFile {
	async create(fs: FileSystem) {
		const app = await App.getApp()
		const defaultPlayer = await app.fileSystem.readFile(
			'data/packages/vanilla/player.json'
		)

		await fs.writeFile('BP/entities/player.json', defaultPlayer)
		await fs.writeFile('BP/loot_tables/empty.json', '{}')
	}
}

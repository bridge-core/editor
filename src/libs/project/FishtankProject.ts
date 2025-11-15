import { join } from 'pathe'
import { fileSystem } from '../fileSystem/FileSystem'
import { Project } from './Project'

export class FishtankProject extends Project {
	public async load() {
		await super.load()

		this.packs = { root: this.path }

		for (const entry of await fileSystem.readDirectoryEntries(join(this.path, 'packs'))) {
			if (!(await fileSystem.exists(join(entry.path, 'pack_icon.png')))) continue

			this.icon = await fileSystem.readFileDataUrl(join(entry.path, 'pack_icon.png'))
		}
	}

	public async dispose() {
		await super.dispose()
	}
}

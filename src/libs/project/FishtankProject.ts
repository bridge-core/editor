import { Project } from './Project'

export class FishtankProject extends Project {
	public async load() {
		await super.load()

		this.packs = { root: this.path }
	}

	public async dispose() {
		await super.dispose()
	}
}

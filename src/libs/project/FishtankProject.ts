import { Project } from './Project'

export class FishtankProject extends Project {
	public async load() {
		await super.load()
	}

	public async dispose() {
		await super.dispose()
	}
}

import { Data } from './Data'

export class ProjectData {
	constructor(public data: Data) {}

	public async load() {
		throw new Error('Not implemented')
	}
}

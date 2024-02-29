import { basename } from '@/libs/path'
import { Tab } from './Tab'

export class FileTab extends Tab {
	constructor(public path: string) {
		super()

		this.name.value = basename(path)
	}

	public static canEdit(path: string): boolean {
		return false
	}

	public is(path: string): boolean {
		return false
	}

	public async setup() {}
	public async destroy() {}
	public async activate() {}
	public async deactivate() {}
}

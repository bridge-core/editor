import { basename } from 'pathe'
import { Tab } from './Tab'
import { ref, Ref } from 'vue'

export class FileTab extends Tab {
	public modified: Ref<boolean> = ref(false)

	constructor(public path: string) {
		super()

		this.name.value = basename(path)
	}

	public static canEdit(path: string): boolean {
		return false
	}

	public static editPriority(path: string): number {
		return 0
	}

	public is(path: string): boolean {
		return false
	}

	public async create() {}
	public async destroy() {}
	public async activate() {}
	public async deactivate() {}
}

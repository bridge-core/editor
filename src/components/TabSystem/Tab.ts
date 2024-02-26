import { basename } from '@/libs/path'
import { v4 as uuid } from 'uuid'
import { Component, Ref, ref } from 'vue'

export class Tab {
	public id = uuid()
	public component: Component | null = null
	public name = ref('New Tab')
	public icon: Ref<string | null> = ref(null)

	constructor(public path: string) {
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

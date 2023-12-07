import { v4 as uuid } from 'uuid'
import { Component, Ref, ref } from 'vue'

export class Tab {
	public id = uuid()
	public component: Component | null = null
	public name = ref('New Tab')
	public icon: Ref<string | null> = ref(null)

	public async setup() {}
	public async destroy() {}
	public async activate() {}
	public async deactivate() {}
}

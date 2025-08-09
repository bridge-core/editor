import { Event } from '@/libs/event/Event'
import { v4 as uuid } from 'uuid'
import { Component, Ref, ref } from 'vue'

export type RecoveryState = { id: string; state: any; type: string; temporary: boolean; [key: string]: any }

export class Tab {
	public id = uuid()
	public component: Component | null = null
	public name = ref('New Tab')
	public icon: Ref<string | null> = ref(null)
	public active: boolean = false
	public temporary: Ref<boolean> = ref(false)

	public savedState = new Event<void>()

	public async create() {}
	public async destroy() {}
	public async activate() {}
	public async deactivate() {}

	public async getState(): Promise<any> {}
	public async recover(state: any) {}

	public async saveState() {
		this.savedState.dispatch()
	}
}

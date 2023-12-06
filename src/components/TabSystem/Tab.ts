import { v4 as uuid } from 'uuid'
import { Component } from 'vue'

export class Tab {
	public id = uuid()
	public component: Component | null = null
	public name = 'New Tab'
	public icon: string | null = null
}

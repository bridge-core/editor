import { Component as VueComponent } from 'vue'
import { v4 as uuid } from 'uuid'

export abstract class Window {
	protected id: string = uuid()

	constructor(protected component: VueComponent) {}
}

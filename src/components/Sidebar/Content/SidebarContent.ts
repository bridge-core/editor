import { Component } from 'vue'

export abstract class SidebarContent {
	protected abstract actions?: ContentAction[]
	protected abstract component: Component
}

export interface IContentAction {
	icon: string
	color?: string

	onClick: () => void
}
export class ContentAction {
	constructor(protected config: IContentAction) {}
}

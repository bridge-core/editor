import { AppMenu } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import { Disposable } from '@/types/disposable'
import { addKeyBinding, KeyBinding } from '@/appCycle/keyBindings'

export interface AppMenu {
	displayName: string
	displayIcon?: string
	onClick?: () => void
	elements?: AppMenuElement[]
}
export interface AppMenuElement {
	isHidden?: boolean
	displayName: string
	displayIcon?: string
	elements?: (() => AppMenuElement[]) | AppMenuElement[]
	keyBinding?: KeyBinding
	onClick?: () => void
}

/**
 * Adds new entry to the app menu
 * @param config
 */
export function createAppMenu(config: AppMenu, addMenu = true) {
	const appMenuUUID = uuid()
	let disposables: Disposable[] = []

	if (addMenu) {
		Vue.set(AppMenu, appMenuUUID, config)
		//Configure keyBindings
		disposables = registerKeyBindings(config.elements ?? [])
	}

	return {
		dispose: () => {
			Vue.delete(AppMenu, appMenuUUID)
			disposables.forEach(disposable => disposable.dispose())
		},
		add: () => {
			Vue.set(AppMenu, appMenuUUID, config)
			disposables = registerKeyBindings(config.elements ?? [])
		},
	}
}

function registerKeyBindings(elements: AppMenuElement[]) {
	let disposables: Disposable[] = []

	elements.forEach(({ keyBinding, onClick, elements }) => {
		if (keyBinding && onClick)
			disposables.push(addKeyBinding(keyBinding, onClick))
		else if (elements)
			disposables.push(
				...registerKeyBindings(
					typeof elements === 'function' ? elements() : elements
				)
			)
	})

	return disposables
}

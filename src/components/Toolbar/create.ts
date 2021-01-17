import { AppMenu } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import type { IDisposable } from '@/types/disposable'
import { addKeyBinding, KeyBinding } from '@/appCycle/keyBindings'

export interface IAppMenu {
	displayName: string
	displayIcon?: string
	onClick?: () => void
	elements?: IAppMenuElement[]
}
export interface IAppMenuElement {
	isHidden?: boolean
	displayName: string
	displayIcon?: string
	elements?: (() => IAppMenuElement[]) | IAppMenuElement[]
	keyBinding?: KeyBinding
	onClick?: () => void
}

/**
 * Adds new entry to the app menu
 * @param config
 */
export function createAppMenu(config: IAppMenu, addMenu = true) {
	const appMenuUUID = uuid()
	let disposables: IDisposable[] = []

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

function registerKeyBindings(elements: IAppMenuElement[]) {
	let disposables: IDisposable[] = []

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

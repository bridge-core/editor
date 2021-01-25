import { AppMenu } from './state'
import { v4 as uuid } from 'uuid'
import Vue from 'vue'
import { IDisposable } from '@/types/disposable'
import { KeyBindingManager } from '../Actions/KeyBindingManager'
import { IKeyBindingConfig } from '../Actions/KeyBinding'

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
	keyBinding?: IKeyBindingConfig
	onClick?: () => void
}

/**
 * Adds new entry to the app menu
 * @param config
 */
export function createAppMenu(
	keyBindingManager: KeyBindingManager,
	config: IAppMenu,
	addMenu = true
) {
	const appMenuUUID = uuid()
	let disposables: IDisposable[] = []

	if (addMenu) {
		Vue.set(AppMenu, appMenuUUID, config)
		//Configure keyBindings
		disposables = registerKeyBindings(
			keyBindingManager,
			config.elements ?? []
		)
	}

	return {
		dispose: () => {
			Vue.delete(AppMenu, appMenuUUID)
			disposables.forEach(disposable => disposable.dispose())
		},
		add: () => {
			Vue.set(AppMenu, appMenuUUID, config)
			disposables = registerKeyBindings(
				keyBindingManager,
				config.elements ?? []
			)
		},
	}
}

function registerKeyBindings(
	keyBindingManager: KeyBindingManager,
	elements: IAppMenuElement[]
) {
	let disposables: IDisposable[] = []

	elements.forEach(({ keyBinding, onClick, elements }) => {
		if (keyBinding && onClick)
			disposables.push(
				keyBindingManager.addKeyBinding({
					...keyBinding,
					onTrigger: onClick,
				})
			)
		else if (elements)
			disposables.push(
				...registerKeyBindings(
					keyBindingManager,
					typeof elements === 'function' ? elements() : elements
				)
			)
	})

	return disposables
}

import {
	computed,
	markRaw,
	reactive,
	readonly,
	ref,
	shallowReactive,
	shallowReadonly,
	watch,
	watchEffect,
	shallowRef,
} from 'vue'
import { IModuleConfig } from '../types'
import { SimpleAction, IActionConfig } from '/@/components/Actions/SimpleAction'

export const CommandBarExtensionItems = new Set<SimpleAction>()

export const ReactivityModule = () => {
	return {
		ref,
		shallowRef,
		computed,
		reactive,
		shallowReactive,
		readonly,
		shallowReadonly,
		markRaw,
		watch,
		watchEffect,
	}
}

import { IModuleConfig } from '../types'
import { createWindow } from '/@/components/Windows/create'
import { Component as VueComponent } from 'vue'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { DropdownWindow } from '/@/components/Windows/Common/Dropdown/DropdownWindow'
import { InputWindow } from '/@/components/Windows/Common/Input/InputWindow'
import { NewBaseWindow } from '/@/components/Windows/NewBaseWindow'

export const WindowModule = ({}: IModuleConfig) => ({
	BaseWindow: NewBaseWindow,
	createWindow: (
		vueComponent: VueComponent,
		state: Record<string, unknown>
	) => {
		console.warn(
			'[@bridge/windows] Calling "createWindow" is deprecated. Please replace direct function calls by defining a class based window instead.'
		)

		return createWindow(vueComponent, state)
	},
	createInformationWindow: (displayName: string, displayContent: string) =>
		new InformationWindow({
			name: displayName,
			description: displayContent,
		}),
	createInputWindow: (
		displayName: string,
		inputLabel: string,
		defaultValue: string,
		onConfirm: (input: string) => void,
		expandText?: string
	) =>
		new InputWindow({
			name: displayName,
			label: inputLabel,
			default: defaultValue,
			expandText,
			onConfirm,
		}),
	createDropdownWindow: (
		displayName: string,
		placeholder: string,
		options: Array<string>,
		defaultSelected: string,
		onConfirm: (input: string) => void
	) =>
		new DropdownWindow({
			name: displayName,
			default: defaultSelected,
			options,
			placeholder,
			onConfirm,
		}),
	createConfirmWindow: (
		displayContent: string,
		confirmText: string,
		cancelText: string,
		onConfirm: () => void,
		onCancel: () => void
	) =>
		new ConfirmationWindow({
			description: displayContent,
			confirmText,
			cancelText,
			onConfirm,
			onCancel,
		}),
})

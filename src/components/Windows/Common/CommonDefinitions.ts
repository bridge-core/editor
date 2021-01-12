import { createWindow } from '../create'
import InformationComponent from './Information/Information.vue'
import InputComponent from './Input/Input.vue'
import DropdownComponent from './Dropdown/Dropdown.vue'
import ConfirmComponent from './Confirm/Confirm.vue'

export function createInformationWindow(
	displayName: string,
	displayContent: string,
	callback?: () => void
) {
	const Information = createWindow(InformationComponent, {
		windowTitle: displayName,
		content: displayContent,
		callback: async () => {
			await callback?.()
			Information.status.setDone?.()
		},
	})
	Information.open()
	return Information
}

export function createInputWindow(
	displayName: string,
	inputLabel: string,
	defaultValue: string,
	expandText: string,
	onConfirm: (input: string) => void
) {
	const Input = createWindow(InputComponent, {
		windowTitle: displayName,
		label: inputLabel,
		inputValue: defaultValue,
		expandText: expandText ?? '',
		onConfirmCb: onConfirm,
	})
	Input.open()
	return Input
}

export function createDropdownWindow(
	displayName: string,
	placeholder: string,
	options: Array<string>,
	defaultSelected: string,
	onConfirm: (input: string) => void
) {
	const Dropdown = createWindow(DropdownComponent, {
		windowTitle: displayName,
		placeholder,
		selectedValue: defaultSelected,
		items: options,
		onConfirmCb: onConfirm,
	})
	Dropdown.open()
	return Dropdown
}

export function createConfirmWindow(
	displayContent: string,
	confirmText: string,
	cancelText: string,
	onConfirm: () => void,
	onCancel: () => void
) {
	const Confirm = createWindow(ConfirmComponent, {
		content: displayContent,
		confirmText,
		cancelText,
		onConfirmCb: onConfirm,
		onCancelCb: onCancel,
	})
	Confirm.open()
	return Confirm
}

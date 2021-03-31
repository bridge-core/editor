import { createWindow } from '../create'
import InputComponent from './Input/Input.vue'
import DropdownComponent from './Dropdown/Dropdown.vue'

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

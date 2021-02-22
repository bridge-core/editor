import { IModuleConfig } from '../types'
import {
	createInformationWindow,
	createInputWindow,
	createDropdownWindow,
} from '/@/components/Windows/Common/CommonDefinitions'
import { createWindow } from '/@/components/Windows/create'
import { Component as VueComponent } from 'vue'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'

export const WindowModule = ({}: IModuleConfig) => ({
	BaseWindow,
	createWindow: (
		vueComponent: VueComponent,
		state: Record<string, unknown>
	) => createWindow(vueComponent, state),
	createInformationWindow: (displayName: string, displayContent: string) =>
		createInformationWindow(displayName, displayContent),
	createInputWindow: (
		displayName: string,
		inputLabel: string,
		defaultValue: string,
		expandText: string,
		onConfirm: (input: string) => void
	) =>
		createInputWindow(
			displayName,
			inputLabel,
			defaultValue,
			expandText,
			onConfirm
		),
	createDropdownWindow: (
		displayName: string,
		placeholderText: string,
		options: Array<string>,
		defaultSelected: string,
		onConfirm: (input: string) => void
	) =>
		createDropdownWindow(
			displayName,
			placeholderText,
			options,
			defaultSelected,
			onConfirm
		),
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

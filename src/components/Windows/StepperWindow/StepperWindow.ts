import { ComputedRef, reactive } from 'vue'
import { translate as t } from '../../Locales/Manager'
import { Sidebar, SidebarItem } from '../Layout/Sidebar'
import { IWindowState, NewBaseWindow } from '../NewBaseWindow'
import { IStep } from './Step'
import StepperWindowComponent from './StepperWindow.vue'

interface IStepperConfirmConfig {
	name: string
	color: string
	icon?: string
	isDisabled: boolean
	isLoading: boolean
	onConfirm: () => void
}

export interface IStepperWindowState extends IWindowState {
	steps: IStep[]
	windowTitle: string
	confirm: IStepperConfirmConfig
}
export interface IStepperWindowOptions {
	windowTitle?: string
	confirm?: IStepperConfirmConfig
	disposeOnClose?: boolean
	keepAlive?: boolean
}

export class StepperWindow extends NewBaseWindow {
	protected state: IStepperWindowState = reactive({
		...super.getState(),
		steps: [],
		actions: [],
		windowTitle: '[Unknown]',

		// Default confirm config
		confirm: {
			name: t('general.confirm'),
			color: 'primary',
			isDisabled: false,
			isLoading: false,
			onConfirm: () => {},
		},
	})
	protected sidebar = new Sidebar([], false)

	getState() {
		return this.state
	}

	constructor({
		windowTitle,
		confirm,
		disposeOnClose,
		keepAlive,
	}: IStepperWindowOptions) {
		super(StepperWindowComponent, disposeOnClose, keepAlive)

		if (windowTitle) this.state.windowTitle = windowTitle
		if (confirm) this.state.confirm = confirm
	}

	addStep(step: IStep) {
		this.state.steps.push(step)
		this.sidebar.addElement(
			new SidebarItem({
				icon: step.icon,
				id: step.id,
				color: step.color ?? 'accent',
				text: step.name,
				status: reactive({
					showStatus: false,
					// TODO - translate
					message: 'This step has incomplete data!',
				}),
			})
		)
	}

	/**
	 * Updates the confirm button config on the stepper window while maintaing reactivity
	 */
	updateConfirmState(config: Partial<IStepperConfirmConfig>) {
		if (config.name) this.state.confirm.name = config.name
		if (config.color) this.state.confirm.color = config.color
		if (config.icon) this.state.confirm.icon = config.icon
		if (config.isDisabled) this.state.confirm.isDisabled = config.isDisabled
		if (config.isLoading) this.state.confirm.isLoading = config.isLoading
		if (config.onConfirm) this.state.confirm.onConfirm = config.onConfirm
	}
}

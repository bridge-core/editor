import { ComputedRef, reactive } from 'vue'
import { Sidebar, SidebarItem } from '../Layout/Sidebar'
import { IWindowState, NewBaseWindow } from '../NewBaseWindow'
import { IStep } from './Step'
import StepperWindowComponent from './StepperWindow.vue'

interface IStepperConfirmConfig {
	name: string
	color?: string
	icon?: string
	isDisabled: ComputedRef<boolean>
	isLoading: boolean
	onConfirm: () => void
}

export interface IStepperWindowState extends IWindowState {
	steps: IStep[]
	windowTitle: string
	confirm?: IStepperConfirmConfig
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
}

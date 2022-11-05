import { reactive } from 'vue'
import { Sidebar, SidebarItem } from '../Layout/Sidebar'
import { IWindowState, NewBaseWindow } from '../NewBaseWindow'
import { IStep } from './Step'
import StepperWindowComponent from './StepperWindow.vue'

interface IStepperWindowState extends IWindowState {
	steps: IStep[]
	windowTitle: string
}
export interface IStepperWindowOptions {
	windowTitle: string
	disposeOnClose?: boolean
	keepAlive?: boolean
}

export class StepperWindow extends NewBaseWindow {
	protected state: IStepperWindowState = reactive({
		...super.state,
		steps: [],
		actions: [],
		windowTitle: '[Unknown]',
	})
	protected sidebar = new Sidebar([])

	constructor({
		windowTitle,
		disposeOnClose,
		keepAlive,
	}: IStepperWindowOptions) {
		super(StepperWindowComponent, disposeOnClose, keepAlive)
		this.state.windowTitle = windowTitle
	}

	addStep(step: IStep) {
		this.state.steps.push(step)
		this.sidebar.addElement(
			new SidebarItem({
				icon: step.icon,
				id: step.id,
				color: step.color ?? 'accent',
				text: step.name,
			})
		)
	}
}

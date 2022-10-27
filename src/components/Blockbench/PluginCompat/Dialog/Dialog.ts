import { NewBaseWindow } from '/@/components/Windows/NewBaseWindow'
import ComponentDialog from './ComponentDialog.vue'

type FormResultValue = string | number | boolean | []

interface ActionInterface {
	name: string
	description?: string
	icon: string
	click: (event: Event) => void
	// TODO(BlockbenchPlugins): Implement
	// condition: Condition
}

interface DialogOptions {
	title: string
	id: string
	/**
	 * Default button to press to confirm the dialog. Defaults to the first button.
	 */
	confirmIndex?: number
	/**
	 * Default button to press to cancel the dialog. Defaults to the last button.
	 */
	cancelIndex?: number
	/**
	 *  Function to execute when the user confirms the dialog
	 */
	onConfirm?: (formResult: object) => void
	/**
	 * Function to execute when the user cancels the dialog
	 */
	onCancel?: () => void
	/**
	 * Triggered when the user presses a specific button
	 */
	onButton?: (button_index: number, event?: Event) => void
	/**
	 * Function to run when anything in the form is changed
	 */
	onFormChange?: (form_result: { [key: string]: FormResultValue }) => void
	/**
	 * Array of HTML object strings for each line of content in the dialog.
	 */
	lines?: (string | HTMLElement)[]
	/**
	 * Creates a form in the dialog
	 */
	form?: {
		[formElement: string]: '_' | DialogFormElement
	}
	/**
	 * Vue component
	 */
	component?: Vue.Component
	/**
	 * Order that the different interface types appear in the dialog. Default is 'form', 'lines', 'component'.
	 */
	part_order?: string[]
	form_first?: boolean
	/**
	 * Creates a dialog sidebar
	 */
	sidebar?: DialogSidebarOptions
	/**
	 * Menu in the handle bar
	 */
	// title_menu?: Menu
	/**
	 * If true, the dialog will only have one button to close it
	 */
	singleButton?: boolean
	/**
	 * List of buttons
	 */
	buttons?: string[]
}

interface DialogFormElement {
	label: string
	description?: string
	type:
		| 'text'
		| 'number'
		| 'checkbox'
		| 'select'
		| 'radio'
		| 'textarea'
		| 'vector'
		| 'color'
		| 'file'
		| 'folder'
		| 'save'
		| 'info'
	nocolon?: boolean
	readonly?: boolean
	value?: any
	placeholder?: string
	text?: string
	colorpicker?: any
	min?: number
	max?: number
	step?: number
	height?: number
	options?: object
}

interface DialogSidebarOptions {
	pages?: {
		[key: string]: string | { label: string; icon: string; color?: string }
	}
	page?: string
	// TODO(BlockbenchPlugins): Implement
	// actions?: (Action|ActionInterface|string)[],
	onPageSwitch?: (page: string) => void
}

class DialogWindow extends NewBaseWindow {}

export class Dialog {
	#baseWindow: NewBaseWindow | null = null

	constructor(options: DialogOptions) {
		const component = options.component

		if (component !== undefined) {
			this.#baseWindow = new (class extends NewBaseWindow {
				protected contentComponent = component
				protected title = options.title
				protected id = options.id

				constructor() {
					super(ComponentDialog, true, true)

					this.defineWindow()
				}

				open() {
					this.state.isLoading = false
					super.open()
				}
			})()
		}
	}

	show() {
		this.#baseWindow?.open()
	}
	hide() {
		this.#baseWindow?.close()
	}
}

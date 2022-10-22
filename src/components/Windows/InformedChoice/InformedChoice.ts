import InformedChoiceComponent from './InformedChoice.vue'
import { ActionManager } from '/@/components/Actions/ActionManager'
import { Signal } from '/@/components/Common/Event/Signal'
import { InfoPanel } from '/@/components/InfoPanel/InfoPanel'
import { NewBaseWindow } from '../NewBaseWindow'
import { reactive } from 'vue'

interface IInformedChoiceWindowOpts {
	isPersistent?: boolean
}

export class InformedChoiceWindow extends NewBaseWindow {
	protected _ready = new Signal<ActionManager>()
	protected topPanel?: InfoPanel

	protected state = reactive<any>({
		...super.state,
		actionManager: new ActionManager(),
	})

	get actionManager() {
		return this.state.actionManager
	}

	constructor(
		protected title: string,
		protected opts: IInformedChoiceWindowOpts = {}
	) {
		super(InformedChoiceComponent, true)

		this.defineWindow()
		this.open()
	}

	async open() {
		super.open()
	}

	dispose() {
		super.dispose()
		this.actionManager.dispose()
	}
}

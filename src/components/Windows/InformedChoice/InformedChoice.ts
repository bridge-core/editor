import InformedChoiceComponent from './InformedChoice.vue'
import { BaseWindow } from '/@/components/Windows/BaseWindow'
import { App } from '/@/App'
import { ActionManager } from '/@/components/Actions/ActionManager'
import { Signal } from '/@/components/Common/Event/Signal'

interface IInformedChoiceWindowOpts {
	isPersistent?: boolean
}

export class InformedChoiceWindow extends BaseWindow {
	protected _actionManager!: ActionManager
	protected _ready = new Signal<ActionManager>()

	get actionManager() {
		return new Promise<ActionManager>((resolve) =>
			this._ready.once(resolve)
		)
	}

	constructor(
		protected title: string,
		protected opts: IInformedChoiceWindowOpts = {}
	) {
		super(InformedChoiceComponent, true)

		this.setup()
	}

	async setup() {
		this._actionManager = new ActionManager(await App.getApp())
		this._ready.dispatch(this._actionManager)
		this.defineWindow()
		this.open()
	}

	async open() {
		App.audioManager.playAudio('click5.ogg', 1)
		await this.actionManager
		super.open()
	}

	dispose() {
		super.dispose()
		this._actionManager.dispose()
	}
}

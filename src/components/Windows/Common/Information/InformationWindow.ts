import { BaseWindow } from '/@/components/Windows/BaseWindow'
import InformationWindowComponent from './Information.vue'
import { App } from '/@/App'

export interface IConfirmWindowOpts {
	name?: string
	description: string
	isPersistent?: boolean
	onClose?: () => Promise<any> | any
}

export class InformationWindow extends BaseWindow<void> {
	constructor(protected opts: IConfirmWindowOpts) {
		super(InformationWindowComponent, true, false)
		this.defineWindow()
		this.open()
	}

	get description() {
		return this.opts.description
	}
	get title() {
		return this.opts.name ?? 'general.information'
	}
	get isPersistent() {
		return this.opts.isPersistent ?? true
	}

	async close() {
		App.audioManager.playAudio('click5.ogg', 1)
		super.close(null)
		if (typeof this.opts.onClose === 'function') await this.opts.onClose()
		this.dispatch()
	}
}

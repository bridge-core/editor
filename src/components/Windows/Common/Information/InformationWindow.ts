import { BaseWindow } from '/@/components/Windows/BaseWindow'
import InformationWindowComponent from './Information.vue'

export interface IConfirmWindowOpts {
	name?: string
	description: string
	isPersistent?: boolean
	onClose?: () => Promise<void> | void
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
		new Audio('/audio/click5.ogg').play()
		super.close(null)
		if (typeof this.opts.onClose === 'function') await this.opts.onClose()
		this.dispatch()
	}
}

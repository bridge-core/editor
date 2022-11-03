import InformationWindowComponent from './Information.vue'
import { NewBaseWindow } from '../../NewBaseWindow'

export interface IConfirmWindowOpts {
	title?: string
	/** @deprecated Use "title" instead */
	name?: string
	description: string
	isPersistent?: boolean
	onClose?: () => Promise<void> | void
}

export class InformationWindow extends NewBaseWindow<void> {
	constructor(protected opts: IConfirmWindowOpts) {
		super(InformationWindowComponent, true, false)
		this.defineWindow()
		this.open()
	}

	get description() {
		return this.opts.description
	}
	get title() {
		return this.opts.title ?? this.opts.name ?? 'general.information'
	}
	get isPersistent() {
		return this.opts.isPersistent ?? true
	}

	async close() {
		super.close(null)
		if (typeof this.opts.onClose === 'function') await this.opts.onClose()
		this.dispatch()
	}
}

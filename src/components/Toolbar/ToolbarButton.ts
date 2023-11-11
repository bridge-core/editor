import { v4 as uuid } from 'uuid'
import { EventDispatcher } from '../Common/Event/EventDispatcher'
import { UnwrapNestedRefs } from 'vue'

export class ToolbarButton extends EventDispatcher<void> {
	public readonly id = uuid()
	protected type = 'button'
	constructor(
		protected icon: string,
		protected name: string,
		protected callback: () => void,
		protected shouldRender: UnwrapNestedRefs<{ value: boolean }>
	) {
		super()
	}

	toNestedMenu() {
		return <const>{
			type: 'button',
			icon: this.icon,
			name: this.name,
			onTrigger: () => this.trigger(),
		}
	}

	trigger() {
		this.callback()
		this.dispatch()
	}

	dispose() {}
}

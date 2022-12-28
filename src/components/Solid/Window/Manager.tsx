import { Component, createSignal, For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { toVue } from '../toVue'
import { SolidWindow } from './Window'

export class SolidWindowManager {
	protected readState: () => SolidWindow<any>[]
	protected writeState: (val: SolidWindow<any>[]) => void

	constructor() {
		;[this.readState, this.writeState] = createSignal([])
	}

	addWindow(window: SolidWindow<any>) {
		this.writeState([...this.readState(), window])

		return {
			dispose: () =>
				this.writeState(this.readState().filter((w) => w !== window)),
		}
	}

	getWindows() {
		return this.readState()
	}

	getComponent(): Component {
		return () => (
			<>
				<For each={this.readState()}>
					{(window) => <Dynamic component={window.windowComponent} />}
				</For>
			</>
		)
	}

	getVueComponent() {
		return toVue(this.getComponent())
	}
}

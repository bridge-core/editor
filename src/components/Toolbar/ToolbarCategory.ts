import { App } from '/@/App'
import { Action } from '/@/components/Actions/Action'
import { IDisposable } from '/@/types/disposable'
import { v4 as uuid } from 'uuid'
import { EventDispatcher } from '../Common/Event/EventDispatcher'
import { del, reactive, set } from 'vue'
import { Divider } from './Divider'

export class ToolbarCategory extends EventDispatcher<void> {
	public readonly id = uuid()
	protected type = 'category'
	public shouldRender = reactive({ value: true })

	protected state: Record<string, Action | ToolbarCategory | Divider> =
		reactive({})
	protected disposableItems: Record<string, IDisposable | undefined> = {}
	public disposables: IDisposable[] = []

	constructor(protected icon: string, protected name: string) {
		super()
	}

	addItem(item: Action | ToolbarCategory | Divider) {
		set(this.state, item.id, item)
		this.disposableItems[item.id] = item.on(() => this.trigger())
		return this
	}
	disposeItem(item: Action | ToolbarCategory | Divider) {
		del(this.state, item.id)
		this.disposableItems[item.id]?.dispose()

		this.disposableItems[item.id] = undefined
	}

	toNestedMenu() {
		return <const>{
			type: 'submenu',
			icon: this.icon,
			name: this.name,
			actions: Object.values(this.state).map((item) => {
				if (item instanceof Action) {
					return {
						...item.getConfig(),
						description: undefined,
						keyBinding: undefined,
					}
				} else if (item instanceof ToolbarCategory) {
					return null
				} else if (item instanceof Divider) {
					return <const>{ type: 'divider' }
				}

				throw new Error(`Unknown toolbar item type: ${item}`)
			}),
		}
	}

	trigger() {
		this.dispatch()
	}

	dispose() {
		for (const disposable of this.disposables) {
			disposable.dispose()
		}

		App.toolbar.disposeCategory(this)
	}
}

import { App } from '/@/App'
import { Action } from '/@/components/Actions/Action'
import { IDisposable } from '/@/types/disposable'
import { v4 as uuid } from 'uuid'
import { EventDispatcher } from '../Common/Event/EventDispatcher'
import { del, reactive, set, shallowReactive } from 'vue'
import { Divider } from './Divider'

export class ToolbarCategory extends EventDispatcher<void> {
	public readonly id = uuid()
	protected type = 'category'
	protected shouldRender = true
	protected isVisible = false

	protected state: Record<string, Action | ToolbarCategory | Divider> =
		reactive({})
	protected disposables: Record<string, IDisposable | undefined> = {}

	constructor(protected icon: string, protected name: string) {
		super()

		App.getApp().then((app) => {
			app.mobile.change.on((isMobile) => this.setShouldRender(!isMobile))
		})
	}

	setShouldRender(shouldRender: boolean) {
		this.shouldRender = shouldRender
	}

	addItem(item: Action | ToolbarCategory | Divider) {
		set(this.state, item.id, item)
		this.disposables[item.id] = item.on(() => this.trigger())
		return this
	}
	disposeItem(item: Action | ToolbarCategory | Divider) {
		del(this.state, item.id)
		this.disposables[item.id]?.dispose()

		this.disposables[item.id] = undefined
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
		this.isVisible = false
		this.dispatch()
	}

	dispose() {
		App.toolbar.disposeCategory(this)
	}
}

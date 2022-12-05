import { Component, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { toSignal } from '../Solid/toSignal'
import { toVue } from '../Solid/toVue'
import { TabBar } from './TabBar'
import { App } from '/@/App'

export const PanelContent: Component = (props) => {
	const [activeTab] = toSignal(App.bottomPanel.activeTab)
	const [tabs] = toSignal(App.bottomPanel.tabs)

	return (
		<div class="bottom-panel-content pa-2 pb-0">
			<Show when={tabs().length > 1}>
				<TabBar />
			</Show>

			<div
				class="bottom-panel-content-container"
				classList={{
					'bottom-panel-content-container-full-height':
						tabs().length <= 1,
				}}
			>
				<Dynamic component={activeTab()?.component} />
			</div>
		</div>
	)
}

export const VuePanelContent = toVue(PanelContent)

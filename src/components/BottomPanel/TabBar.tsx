import { Component, For } from 'solid-js'
import { SolidIcon } from '../Solid/Icon/SolidIcon'
import { SolidSpacer } from '../Solid/SolidSpacer'
import { toSignal } from '../Solid/toSignal'
import { App } from '/@/App'

export const TabBar: Component = (props) => {
	const [tabs] = toSignal(App.bottomPanel.tabs)
	const [activeTab] = toSignal(App.bottomPanel.activeTab)
	// const [_, setIsVisible] = toSignal(App.bottomPanel.isVisible)

	return (
		<div class="d-flex align-center ma-1">
			<For each={tabs()}>
				{(tab, i) => (
					<div
						class="bottom-panel-tab"
						classList={{
							'bottom-panel-tab-active elevation-4':
								tab === activeTab(),
							'ml-2': i() > 0,
						}}
						onClick={() => App.bottomPanel.selectTab(tab)}
					>
						<SolidIcon icon={tab.icon} class="mr-1" />
						{tab.name}
					</div>
				)}
			</For>

			<SolidSpacer />

			<SolidIcon icon="mdi-close" onClick={() => {}} />
		</div>
	)
}

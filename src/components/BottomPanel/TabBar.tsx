import { Component, For } from 'solid-js'
import { useRipple } from '../Solid/Directives/Ripple/Ripple'
import { SolidIcon } from '../Solid/Icon/SolidIcon'
import { SolidSpacer } from '../Solid/SolidSpacer'
import { toSignal } from '../Solid/toSignal'
import { App } from '/@/App'

export const TabBar: Component = (props) => {
	const ripple = useRipple()
	const [tabs] = toSignal(App.bottomPanel.tabs)
	const [activeTab] = toSignal(App.bottomPanel.activeTab)
	const [_, setIsVisible] = toSignal(App.bottomPanel.isVisible)

	return (
		<div class="d-flex align-center ma-1">
			<div
				class="bottom-panel-tab-bar d-flex align-center mr-1"
				classList={{ 'pl-2': tabs()[0] === activeTab() }}
			>
				<For each={tabs()}>
					{(tab, i) => (
						<div
							use:ripple={tab !== activeTab()}
							class="bottom-panel-tab"
							classList={{
								'bottom-panel-tab-active elevation-2 white--text':
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
			</div>

			<SolidSpacer />

			<SolidIcon icon="mdi-close" onClick={() => setIsVisible(false)} />
		</div>
	)
}

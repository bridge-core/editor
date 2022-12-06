import { Component, For } from 'solid-js'
import { useTranslations } from '../Composables/useTranslations'
import { useRipple } from '../Solid/Directives/Ripple/Ripple'
import { SolidIcon } from '../Solid/Icon/SolidIcon'
import { SolidIconButton } from '../Solid/Inputs/IconButton/IconButton'
import { SolidSpacer } from '../Solid/SolidSpacer'
import { toSignal } from '../Solid/toSignal'
import { App } from '/@/App'

export const TabBar: Component = (props) => {
	const ripple = useRipple()
	const { t } = useTranslations()
	const [tabs] = toSignal(App.bottomPanel.tabs)
	const [activeTab] = toSignal(App.bottomPanel.activeTab)
	const [_, setIsVisible] = toSignal(App.bottomPanel.isVisible)

	return (
		<div class="d-flex align-center ma-1">
			<div class="bottom-panel-tab-bar d-flex align-center mr-1 pl-2">
				<For each={tabs()}>
					{(tab, i) => (
						<div
							use:ripple={tab !== activeTab()}
							class="bottom-panel-tab flex-shrink-0"
							classList={{
								'bottom-panel-tab-active elevation-2 white--text':
									tab === activeTab(),
								'ml-2': i() > 0,
							}}
							onClick={() => App.bottomPanel.selectTab(tab)}
						>
							<SolidIcon icon={tab.icon} class="mr-1" />
							{t(tab.name)}
						</div>
					)}
				</For>
			</div>

			<SolidSpacer />

			<SolidIconButton
				icon="mdi-close"
				onClick={() => setIsVisible(false)}
			/>
		</div>
	)
}

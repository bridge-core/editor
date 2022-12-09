<template>
	<div
		class="py-2 px-2"
		:class="{
			'pl-0': !isAttachedRight && isContentVisible,
			'pr-0': isAttachedRight && isContentVisible,
		}"
		:style="{
			height: `${height}px`,
			width: '100%',
		}"
	>
		<!-- Floating button to open/close bottom panel -->
		<div
			class="d-flex justify-center align-center"
			:class="{
				'rounded-l-lg': isAttachedRight,
				'rounded-r-lg': !isAttachedRight,
			}"
			:style="{
				background: 'var(--v-expandedSidebar-base)',
				position: 'fixed',
				left: isAttachedRight ? null : 0,
				right: isAttachedRight ? 0 : null,
				bottom: '8px',
				height: '28px',
				width: '60px',
			}"
		>
			<v-btn @click="isVisible = !isVisible" icon>
				<v-icon v-if="!isVisible">mdi-chevron-up</v-icon>
				<v-icon v-else>mdi-chevron-down</v-icon>
			</v-btn>
		</div>

		<BridgeSheet v-if="isVisible" style="height: 100%; width: 100%">
			<VuePanelContent />
		</BridgeSheet>
	</div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { App } from '/@/App'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import { VuePanelContent } from './PanelContent'
import { settingsState } from '../Windows/Settings/SettingsState'
import { useSidebarState } from '../Composables/Sidebar/useSidebarState'

const height = App.bottomPanel.height
const isVisible = App.bottomPanel.isVisible

const { isContentVisible, isAttachedRight } = useSidebarState()

// Dispatch window resize event when bottom panel is shown/hidden
watch(isVisible, () => {
	App.getApp().then((app) => app.windowResize.dispatch())
})

// Hide bottom panel on mobile
watch(App.instance.mobile.is, (isMobile) => {
	if (isMobile) isVisible.value = false
})
</script>

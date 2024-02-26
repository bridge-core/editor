<template>
	<div class="w-full h-full max-h-full flex flex-col">
		<div class="w-full h-8 flex gap-4 mb-2">
			<div
				v-for="tab in instance.tabs.value"
				class="flex items-center gap-1 p-2 rounded cursor-pointer"
				:style="{
					background: instance.selectedTab.value == tab ? 'var(--theme-color-menuAlternate)' : 'transparent',
				}"
				@click="() => instance.selectTab(tab)"
			>
				<Icon v-if="tab.icon" :icon="tab.icon.value ?? 'help'" class="text-base text-behaviorPack" />

				<span class="font-inter select-none">{{ tab.name.value ?? 'Tab' }}</span>

				<IconButton icon="close" class="text-base" @click.stop="() => instance.removeTab(tab)" />
			</div>
		</div>

		<div class="flex-1">
			<component
				v-if="instance.selectedTab.value"
				:instance="instance.selectedTab.value"
				:is="instance.selectedTab.value.component"
				:key="instance.selectedTab.value.id"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import IconButton from '@/components/Common/IconButton.vue'

import { TabSystem } from './TabSystem'

defineProps({
	instance: {
		type: TabSystem,
		required: true,
	},
})
</script>

<template>
	<div class="w-full h-full">
		<div class="w-full h-8 flex gap-4">
			<div
				v-for="tab in instance.tabs.value"
				class="flex items-center gap-1"
			>
				<Icon
					v-if="tab.icon"
					:icon="tab.icon.value ?? ''"
					class="text-base text-behaviorPack"
				/>

				<button class="font-inter">
					{{ tab.name }}
				</button>

				<IconButton
					icon="close"
					class="text-base"
					@click="() => instance.removeTab(tab)"
				/>
			</div>
		</div>

		<component
			v-if="instance.selectedTab.value"
			:instance="instance.selectedTab.value"
			:is="instance.selectedTab.value.component"
			:key="instance.selectedTab.value.id"
		/>
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

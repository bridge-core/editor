<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import IconButton from '@/components/Common/IconButton.vue'

import { TabSystem } from './TabSystem'
import { FileTab } from './FileTab'
import { Settings } from '@/libs/settings/Settings'

defineProps({
	instance: {
		type: TabSystem,
		required: true,
	},
})

const get = Settings.useGet()
</script>

<template>
	<div class="basis-0 min-w-0 flex-1 h-full border-background-secondary">
		<div class="flex gap-2 mb-2 pb-2 overflow-x-scroll">
			<div
				v-for="tab in instance.tabs.value"
				class="flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors duration-100 ease-out group"
				:class="{
					'max-w-[12rem]': get('compactTabDesign'),
					'bg-background-secondary': instance.selectedTab.value === tab,
					'bg-background-transparent hover:bg-background-secondary': instance.selectedTab.value !== tab,
				}"
				@click="() => instance.selectTab(tab)"
			>
				<div class="relative">
					<div
						v-if="tab instanceof FileTab && tab.modified.value"
						class="bg-behaviorPack border-2 border-[var(--border-color)] w-3 h-3 rounded-full absolute right-[-0.25rem] top-1"
						:style="{
							'--border-color':
								instance.selectedTab.value == tab
									? 'var(--theme-color-backgroundSecondary)'
									: 'var(--theme-color-background)',
						}"
					></div>

					<Icon v-if="tab.icon" :icon="tab.icon.value ?? 'help'" class="text-base text-behaviorPack" />
				</div>

				<p
					class="font-theme select-none overflow-hidden text-ellipsis whitespace-nowrap h-6 transition-colors duration-100 ease-out basis-0 grow"
					:class="{
						'text-text': instance.selectedTab.value === tab,
						'text-text-secondary group-hover:text-text': instance.selectedTab.value !== tab,
					}"
				>
					{{ tab.name.value ?? 'Tab' }}
				</p>

				<IconButton icon="close" class="text-base" @click.stop="() => instance.removeTab(tab)" />
			</div>
		</div>

		<div class="w-full tab-content">
			<component
				v-if="instance.selectedTab.value"
				:instance="instance.selectedTab.value"
				:is="instance.selectedTab.value.component"
				:key="instance.selectedTab.value.id"
			/>
		</div>
	</div>
</template>

<style scoped>
.tab-content {
	height: calc(100% - 2.5rem - 0.5rem);
}
</style>

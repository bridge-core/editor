<template>
	<div class="min-w-0 flex flex-1 justify-evenly h-full pt-2 pr-2">
		<TabSystem
			v-for="(tabSystem, index) in TabManager.tabSystems.value"
			:instance="tabSystem"
			:key="tabSystem.id"
			:class="{ 'pr-2 border-r': index !== TabManager.tabSystems.value.length - 1, 'pl-2': index !== 0 }"
		/>
	</div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import TabSystem from './TabSystem.vue'

import { TabManager } from '@/components/TabSystem/TabManager'

watch(TabManager.tabSystems, () => {
	console.log('Updated tabsystems!')
})
</script>

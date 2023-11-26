<template>
	<div>
		<TabSystem
			v-for="tabSystem in instance.tabSystems"
			:instance="tabSystem"
			:key="tabSystem.id"
		/>
	</div>
</template>

<script setup lang="ts">
import TabSystem from './TabSystem.vue'

import { TabManager } from './TabManager'

defineProps({
	instance: {
		type: TabManager,
		required: true,
	},
})
</script>

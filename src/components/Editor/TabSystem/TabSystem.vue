<template>
	<div>
		<component
			v-for="tab in instance.tabs.value"
			:instance="tab"
			:key="tab.id"
			:is="tab.component"
		/>
	</div>
</template>

<script setup lang="ts">
import { TabSystem } from './TabSystem'

defineProps({
	instance: {
		type: TabSystem,
		required: true,
	},
})
</script>

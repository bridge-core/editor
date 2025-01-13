<template>
	<div class="min-w-0 flex-1 h-full pt-2 pr-2">
		<TabSystem v-for="tabSystem in TabManager.tabSystems.value" :instance="tabSystem" :key="tabSystem.id" />
	</div>
</template>

<script setup lang="ts">
import TabSystem from './TabSystem.vue'

import { TabManager } from '@/components/TabSystem/TabManager'
</script>

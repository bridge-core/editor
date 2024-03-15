<template>
	<div class="flex-1 h-full mt-2 mr-2">
		<TabSystem v-for="tabSystem in tabManager.tabSystems" :instance="tabSystem" :key="tabSystem.id" />
	</div>
</template>

<script setup lang="ts">
import TabSystem from './TabSystem.vue'

import { tabManager } from '@/App'
</script>

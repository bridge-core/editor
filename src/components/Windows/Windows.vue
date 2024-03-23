<script setup lang="ts">
import { Windows } from './Windows'
</script>

<template>
	<component v-for="window in Windows.openWindows.value" :key="window.id" :is="window.component" :window="window" />
</template>

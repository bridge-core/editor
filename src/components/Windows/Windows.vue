<script setup lang="ts">
import { Windows } from './Windows'
</script>

<template>
	<component v-for="window in Windows.openWindows.value" :key="window.uuid" :is="window.component" />
</template>

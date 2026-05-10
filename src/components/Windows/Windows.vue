<script setup lang="ts">
import { Windows } from './Windows'
</script>

<template>
	<TransitionGroup>
		<component
			v-for="window in Windows.openWindows.value"
			:key="window.id"
			:is="window.component"
			:window="window"
		/>
	</TransitionGroup>
</template>

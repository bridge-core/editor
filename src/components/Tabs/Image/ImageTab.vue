<script setup lang="ts">
import { type ImageTab } from './ImageTab'

const { instance }: { instance: ImageTab } = <any>defineProps({
	instance: {
		required: true,
	},
})
</script>

<template>
	<div class="w-full h-full flex justify-center items-center">
		<img class="pixelated h-full object-contain p-8" :src="instance.image.value ?? ''" />
	</div>
</template>

<style scoped>
.pixelated {
	image-rendering: pixelated;
}
</style>

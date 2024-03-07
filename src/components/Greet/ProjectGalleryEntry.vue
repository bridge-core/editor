<script lang="ts" setup>
defineProps({
	name: {
		type: String,
		required: true,
	},
	icon: {
		type: String,
		required: true,
	},
})
</script>

<template>
	<div
		class="flex flex-col bg-background-secondary rounded relative w-36 h-36 cursor-pointer border-transparent border-2 group hover:border-accent transition-colors duration-100 ease-out"
	>
		<div class="w-full rounded overflow-hidden aspect-video">
			<img
				:src="icon"
				class="w-full object-cover group-hover:scale-110 transition-transform duration-100 ease-out -translate-y-1/4 pixelated"
			/>
		</div>
		<p class="text-sm text-center mt-auto mb-auto ml-0.5 mr-0.5 font-inter font-medium">
			{{ name }}
		</p>
	</div>
</template>

<template>
	<span
		class="material-symbols-rounded select-none"
		ref="element"
		:style="color ? { color: `var(--theme-color-${color})` } : {}"
	>
		{{ mdiMap[icon] ?? icon }}
	</span>
</template>

<script setup lang="ts">
// TODO: Remove this later when we fix the data!
const mdiMap: { [key: string]: string | undefined } = {
	'mdi-human': 'accessibility_new',
	'mdi-earth': 'public',
	'mdi-image': 'image',
	'mdi-wrench': 'build',
	'mdi-gift': 'featured_seasonal_and_gifts',
	'mdi-earth-box': 'public',
	'mdi-alarm': 'alarm',
	'mdi-school-outline': 'school',
	'mdi-ab-testing': 'help',
	'mdi-alpha-m': 'help',
}

defineProps({
	icon: {
		type: String,
		required: true,
	},
	color: {
		type: String,
	},
})
</script>

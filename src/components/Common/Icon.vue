<template>
	<span
		class="material-symbols-rounded select-none text-background"
		ref="element"
		:style="{ color: `var(--theme-color-${color})` }"
	>
		{{ mdiMap[icon] ?? icon }}
	</span>
</template>

<script setup lang="ts">
const mdiMap: { [key: string]: string | undefined } = {
	'mdi-human': 'accessibility_new',
	'mdi-earth': 'public',
	'mdi-image': 'image',
	'mdi-wrench': 'build',
}

defineProps({
	icon: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: 'text-text',
	},
})
</script>

<template>
	<span
		class="material-symbols-rounded select-none text-background"
		ref="element"
		:style="style"
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

const { color } = defineProps({
	icon: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: 'text-text',
	},
})

const style = {
	color: `var(--theme-color-${color})`,
}
</script>

<template>
	<span class="material-symbols-rounded text-text select-none">
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
})
</script>

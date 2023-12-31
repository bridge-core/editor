<template>
	<span
		v-if="icon !== 'loading'"
		class="material-symbols-rounded select-none"
		ref="element"
		:style="color ? { color: `var(--theme-color-${color})` } : {}"
		v-bind="$attrs"
	>
		{{ mdiMap[icon] ?? icon }}
	</span>

	<div v-bind="$attrs" v-if="icon === 'loading'" class="spinner" />
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

<style scoped>
.spinner {
	margin-left: 1px;
	margin-right: 1px;
	width: 14px;
	height: 14px;
	border: 2px solid;
	border-bottom-color: transparent;
	border-radius: 50%;
	display: inline-block;
	box-sizing: border-box;
	animation: rotation 1s ease infinite;
}

@keyframes rotation {
	0% {
		transform: rotate(90deg);
	}
	100% {
		transform: rotate(450deg);
	}
}
</style>

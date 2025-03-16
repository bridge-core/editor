<template>
	<span
		v-if="icon !== 'loading'"
		class="material-symbols-rounded select-none max-w-[1em]"
		ref="element"
		:style="{ color: color ? `var(--theme-color-${color})` : undefined }"
		v-bind="$attrs"
	>
		{{ resolveLegacyIcons(icon) }}
	</span>

	<div v-bind="$attrs" v-if="icon === 'loading'" class="spinner" />
</template>

<script setup lang="ts">
// TODO: Remove this later when we fix the data!
const mdiMap: { [key: string]: string | undefined } = {
	'mdi-human': 'accessibility_new',
	'mdi-minecraft': 'deployed_code',
	'mdi-earth': 'public',
	'mdi-image': 'image',
	'mdi-wrench': 'build',
	'mdi-gift': 'featured_seasonal_and_gifts',
	'mdi-earth-box': 'public',
	'mdi-alarm': 'alarm',
	'mdi-school-outline': 'school',
	'mdi-ab-testing': 'help',
	'mdi-alpha-m': 'help',
	'mdi-alpha-m-box-outline': 'data_object',
	'mdi-web': 'language',
	'mdi-tools': 'construction',
	'mdi-skull-outline': 'skull',
	'mdi-language-javascript': 'javascript',
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

function resolveLegacyIcons(icon: string) {
	if (mdiMap[icon]) return mdiMap[icon]

	if (icon.startsWith('mdi-')) return 'help'

	return icon
}
</script>

<style scoped>
.spinner {
	margin: 0.1rem;
	margin-top: 0.3rem;
	margin-bottom: 0.3rem;
	width: 0.8rem;
	height: 0.8rem;
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

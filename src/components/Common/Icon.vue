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
	'mdi-ab-testing': 'science',
	'mdi-alpha-m': 'metro',
	'mdi-alpha-m-box-outline': 'data_object',
	'mdi-web': 'language',
	'mdi-tools': 'construction',
	'mdi-skull-outline': 'skull',
	'mdi-language-javascript': 'javascript',
	'mdi-cube-outline': 'deployed_code',
	'mdi-panda': 'pets',
	'mdi-pig': 'savings',
	'mdi-fish': 'phishing',
	'mdi-cow': 'pets',
	'mdi-spider': 'pest_control',
	'mdi-ghost-outline': 'motion_blur',
	'mdi-paw': 'pets',
	'mdi-fishbowl': 'phishing',
	'mdi-egg-outline': 'egg',
	'mdi-flower': 'deceased',
	'mdi-map-plus': 'map',
	'mdi-cube-scan': 'view_in_ar',
	'mdi-movie-open-outline': 'movie',
	'mdi-forum': 'forum',
	'mdi-weather-fog': 'foggy',
	'mdi-book-outline': 'book',
	'mdi-pentagon-outline': 'pentagon',
	'mdi-movie-search-outline': 'movie',
	'mdi-island': 'landscape_2',
	'mdi-function': 'function',
	'mdi-package-variant': 'orders',
	'mdi-sword': 'swords',
	'mdi-test-tube': 'labs',
	'mdi-snowflake': 'ac_unit',
	'mdi-google-controller': 'stadia_controller',
	'mdi-hat-fedora': 'chef_hat',
	'mdi-camera': 'photo_camera',
	'mdi-texture': 'texture',
	'mdi-castle': 'castle',
	'mdi-crosshairs': 'filter_center_focus',
	'mdi-library-shelves': 'shelves',
	'mdi-view-list': 'list',
	'mdi-window-maximize': 'ad',
	'mdi-store-outline': 'store',
	'mdi-script-text-outline': 'code_blocks',
	'mdi-food-apple-outline': 'nutrition',
	'mdi-shovel': 'swords',
	'mdi-pickaxe': 'swords',
	'mdi-hanger': 'checkroom',
	'mdi-axe': 'swords',
	'mdi-circle': 'motion_blur',
	'mdi-puzzle': 'extension',
	'mdi-timer': 'timer',
	'mdi-file-image-outline': 'image',
}

const props = defineProps({
	icon: {
		type: String,
		required: true,
	},
	color: {
		type: String,
	},
	fallback: {
		type: String,
	},
})

function resolveLegacyIcons(icon: string | undefined) {
	if (!icon) return props.fallback ?? 'help'

	if (mdiMap[icon]) return mdiMap[icon]

	if (icon.startsWith('mdi-')) {
		console.warn(`Mdi icon with no override: ${icon}!`)

		return props.fallback ?? 'help'
	}

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

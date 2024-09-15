<template>
	<button
		class="px-2 py-1 rounded font-theme font-medium select-none transition-colors duration-100 ease-out"
		:class="{
			[`bg-[var(--color)] text-[var(--text-color)] hover:bg-[var(--color-hover)] hover:text-[var(--text-color-hover)]`]:
				enabled,
			'bg-background-secondary text-text-secondary cursor-default': !enabled,
		}"
		:style="{
			'--color': `var(--theme-color-${color})`,
			'--text-color': `var(--theme-color-${textColor})`,
			'--color-hover': `var(--theme-color-${colorHover})`,
			'--text-color-hover': `var(--theme-color-${textColorHover})`,
		}"
	>
		{{ text }}
	</button>
</template>

<script setup lang="ts">
defineProps({
	text: {
		type: String,
		required: true,
	},
	enabled: {
		type: Boolean,
		default: true,
	},
	color: {
		type: String,
		default: 'primary',
	},
	colorHover: {
		type: String,
		default: 'accent',
	},
	textColor: {
		type: String,
		default: 'accent',
	},
	textColorHover: {
		type: String,
		default: 'accentSecondary',
	},
})
</script>

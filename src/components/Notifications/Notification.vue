<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import Progress from '@/components/Common/Progress.vue'

defineProps({
	icon: {
		type: String,
		default: 'help',
	},
	type: {
		type: String,
		default: 'button',
	},
	progress: {
		type: Number,
	},
	maxProgress: {
		type: Number,
	},
	color: {
		type: String,
		default: 'background',
	},
	colorHover: {
		type: String,
		default: 'primary',
	},
	iconColor: {
		type: String,
		default: 'accent',
	},
	iconColorHover: {
		type: String,
		default: 'accent',
	},
})
</script>

<template>
	<div
		class="w-10 h-10 shrink-0 bg-[var(--color)] hover:bg-[var(--color-hover)] rounded flex justify-center items-center transition-colors duration-100 ease-out cursor-pointer group"
		:style="{
			'--color': `var(--theme-color-${color})`,
			'--color-hover': `var(--theme-color-${colorHover})`,
		}"
	>
		<Icon
			v-if="type === 'button'"
			:icon="icon"
			class="text-[var(--color)] group-hover:text-[var(--color-hover)] transition-colors duration-100 ease-out"
			:style="{
				'--color': `var(--theme-color-${iconColor})`,
				'--color-hover': `var(--theme-color-${iconColorHover})`,
			}"
		/>

		<div v-if="type === 'progress'" class="w-10 h-10 relative">
			<Progress
				class="w-7 h-7 absolute left-[0.375rem] top-[0.375rem] stroke-[var(--color)] group-hover:stroke-[var(--color-hover)] transition-colors duration-100 ease-out"
				:progress="(progress ?? 0) / (maxProgress ?? 100)"
				:style="{
					'--color': `var(--theme-color-${iconColor})`,
					'--color-hover': `var(--theme-color-${iconColorHover})`,
				}"
			/>

			<Icon
				:icon="icon"
				class="text-[var(--color)] group-hover:text-[var(--color-hover)] text-xs absolute left-[0.88rem] top-[0.75rem] transition-colors duration-100 ease-out"
				:style="{
					'--color': `var(--theme-color-${iconColor})`,
					'--color-hover': `var(--theme-color-${iconColorHover})`,
				}"
			/>
		</div>
	</div>
</template>

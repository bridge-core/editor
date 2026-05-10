<template>
	<div class="relative text-base" @click.stop="$emit('update:modelValue', !modelValue)">
		<div class="w-[3rem] h-6 group">
			<div
				class="w-full h-full rounded-full transition-colors duration-100 ease-out border-2"
				:class="{
					'border-[var(--color)]': !modelValue,
					'border-primary': modelValue,
				}"
				:style="{
					'--color': `var(--theme-color-${borderColor})`,
				}"
			/>

			<div
				class="rounded-full w-4 h-4 absolute top-1 transition-[left, background] duration-100 ease-out group-hover:bg-accent"
				:class="{
					'left-[0.25rem] bg-background-tertiary': !modelValue,
					'left-[1.75rem] bg-primary': modelValue,
				}"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineProps({
	modelValue: {
		type: Boolean,
	},
	borderColor: {
		type: String,
		default: 'backgroundSecondary',
	},
})
defineEmits(['update:modelValue'])
</script>

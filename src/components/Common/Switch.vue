<template>
	<div class="relative w-[4.25rem] h-5">
		<div
			class="w-full h-full rounded-full transition-colors duration-100 ease-out opacity-20"
			:class="{
				'bg-textAlternate': !modelValue,
				'bg-primary': modelValue,
			}"
			@click.stop="$emit('update:modelValue', !modelValue)"
		/>

		<div
			class="rounded-full w-4 h-4 absolute top-0.5 transition-[left] duration-100 ease-out"
			:class="{
				'left-[0.125rem] bg-textAlternate': !modelValue,
				'left-[1.375rem] bg-primary': modelValue,
			}"
			@click.stop="$emit('update:modelValue', !modelValue)"
		/>
	</div>
</template>

<script lang="ts" setup>
defineProps({
	modelValue: {
		type: Boolean,
		required: true,
	},
})
defineEmits(['update:modelValue'])
</script>

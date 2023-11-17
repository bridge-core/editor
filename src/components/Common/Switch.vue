<template>
	<div class="relative w-24 h-6">
		<div
			class="w-full h-full bg-textAlternate rounded-full transition-colors duration-100 ease-out opacity-20"
			:class="{
				'bg-primary': modelValue,
			}"
			@click.stop="$emit('update:modelValue', !modelValue)"
		/>

		<div
			class="bg-textAlternate rounded-full w-5 h-5 min-w-[1.25rem] absolute top-0.5 transition-[left] duration-100 ease-out"
			:class="{
				'left-[0.125rem]': !modelValue,
				'left-[1.5rem]': modelValue,
				'bg-primary': modelValue,
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

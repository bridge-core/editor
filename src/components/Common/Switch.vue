<template>
	<div class="relative text-base" @click.stop="$emit('update:modelValue', !modelValue)">
		<div class="w-[2.5rem] h-5">
			<div
				class="w-full h-full rounded-full transition-colors duration-100 ease-out opacity-20"
				:class="{
					'bg-background-tertiary': !modelValue,
					'bg-primary': modelValue,
				}"
			/>

			<div
				class="rounded-full w-4 h-4 absolute top-0.5 transition-[left] duration-100 ease-out"
				:class="{
					'left-[0.125rem] bg-background-tertiary': !modelValue,
					'left-[1.375rem] bg-primary': modelValue,
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
})
defineEmits(['update:modelValue'])
</script>

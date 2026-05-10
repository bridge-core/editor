<template>
	<div
		class="border-2 rounded px-3 py-2 transition-colors duration-100 ease-out relative mt-3 select-none"
		:class="{
			'border-[var(--color)] hover:border-accent': !(_focused || focused) && !invalid,
			'border-error hover:border-accent': !(_focused || focused) && invalid,
			'border-primary': _focused || focused,
		}"
		:style="{
			'--color': `var(--theme-color-${borderColor})`,
		}"
	>
		<span class="absolute -top-[0.8rem] left-2 text-xs bg-inherit p-1 text-text-secondary font-theme">{{ label }}</span>
		<slot :focus :blur :focused="_focused || focused" />
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const _focused = ref(false)

defineProps({
	label: {
		type: String,
	},
	focused: {
		type: Boolean,
		default: false,
	},
	borderColor: {
		type: String,
		default: 'backgroundSecondary',
	},
	invalid: {
		type: Boolean,
		required: false,
	},
})

function focus() {
	_focused.value = true
}

function blur() {
	_focused.value = false
}

defineExpose({ focus, blur })
</script>

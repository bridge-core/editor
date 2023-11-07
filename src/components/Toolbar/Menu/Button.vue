<template>
	<div @click="$emit('click', $event)" class="m-1 ml-4">
		<span
			class="text-text hover:text-accent transition-colors duration-100 ease-out"
		>
			{{ t(displayName) }}
		</span>
	</div>
</template>

<script setup>
import { useTranslations } from '/@/components/Composables/useTranslations.ts'

const { t } = useTranslations()

defineProps({
	displayName: String,
	displayIcon: String,
	disabled: {
		type: Boolean,
	},
})
</script>

<style scoped>
div {
	-webkit-app-region: drag;
	app-region: drag;
}
</style>

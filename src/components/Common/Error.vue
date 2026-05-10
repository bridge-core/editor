<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import { useTranslate } from '@/libs/locales/Locales'

const t = useTranslate()

defineProps({
	text: {
		type: String,
		required: true,
	},
})
</script>

<template>
	<div class="rounded border-2 border-error p-2 table relative">
		<div class="absolute left-0 top-0 w-full h-full bg-error opacity-10" />

		<div class="flex items-center gap-1">
			<Icon icon="error" class="text-base" />

			<span>{{ t(text) }}</span>
		</div>
	</div>
</template>

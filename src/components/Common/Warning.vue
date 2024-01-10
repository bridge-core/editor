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
	<div class="rounded border-2 border-warning p-2 table relative">
		<div class="absolute left-0 top-0 w-full h-full bg-warning opacity-10 -z-10" />

		<div class="flex items-center gap-1">
			<Icon icon="warning" class="text-base" />

			<span>{{ t(text) }}</span>
		</div>
	</div>
</template>

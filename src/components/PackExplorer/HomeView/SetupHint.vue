<template>
	<div class="d-flex flex-row-reverse">
		<span class="mt-2 accent--text">
			{{ t('general.setup') }}
			<v-icon color="accent">mdi-arrow-right</v-icon>
		</span>
	</div>
</template>

<script setup lang="ts">
import { useTranslations } from '/@/components/Composables/useTranslations'

const { t } = useTranslations()
</script>

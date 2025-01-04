<script lang="ts" setup>
import Icon from './Icon.vue'
import IconButton from './IconButton.vue'

import { Action } from '@/libs/actions/Action'
import { useTranslate } from '@/libs/locales/Locales'

defineProps<{ action: Action }>()

const t = useTranslate()
</script>

<template>
	<div class="text-normal p-2 rounded bg-background-secondary">
		<div class="flex w-full mb-2">
			<Icon v-if="action.icon" class="mr-1 content-center" style="color: var(--theme-color-primary)" :icon="action.icon" />

			<h3 class="text-lg font-medium w-full font-theme">{{ action.name ? t(action.name) : action.id }}</h3>

			<div class="flex-1" />

			<IconButton class="content-center" icon="play_arrow" @click="action.trigger" />
		</div>

		<div class="flex w-full">
			<p v-if="action.description" class="text-text-secondary font-theme">{{ t(action.description) }}</p>

			<div class="flex-1" />

			<p class="text-text-secondary font-theme min-w-max">
				{{ action.keyBinding ?? t('Unbound') }}
			</p>
		</div>
	</div>
</template>

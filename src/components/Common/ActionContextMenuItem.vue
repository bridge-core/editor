<script setup lang="ts">
import Icon from './Icon.vue'

import { ActionManager } from '@/libs/actions/ActionManager'
import { useTranslate } from '@/libs/locales/Locales'

defineProps<{ action: string }>()

const t = useTranslate()
</script>

<template>
	<div
		class="flex item-center group hover:bg-background-tertiary p-2 px-4 cursor-pointer transition-colors duration-100 ease-out"
	>
		<Icon
			:icon="ActionManager.actions[action]?.icon ?? 'help'"
			class="text-base text-primary transition-colors duration-100 ease-out"
		/>
		<span class="ml-2 font-inter select-none min-w-max mr-2">{{
			t(ActionManager.actions[action]?.name ?? 'actions.unknown.name')
		}}</span>

		<span v-if="ActionManager.actions[action]?.keyBinding" class="text-text-secondary ml-auto font-inter">
			{{ ActionManager.actions[action].keyBinding }}
		</span>
	</div>
</template>

<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import IconButton from '@/components/Common/IconButton.vue'
import { useTranslate } from '@/libs/locales/Locales'
import { ActionManager } from '@/libs/actions/ActionManager'

const t = useTranslate()
</script>
<template>
	<div class="flex-col w-full">
		<div
			v-for="action in Object.values(ActionManager.actions)"
			class="text-normal p-2 mb-3 rounded bg-background-secondary w-full"
		>
			<div class="flex w-full mb-2">
				<Icon
					v-if="action.icon"
					class="mr-1 content-center"
					style="color: var(--theme-color-primary)"
					:icon="action.icon"
				/>

				<h3 class="text-lg font-medium w-full font-theme">{{ action.name ? t(action.name) : action.id }}</h3>

				<div class="flex-1" />

				<IconButton class="content-center" icon="play_arrow" @click="action.trigger" />
			</div>

			<div class="flex w-full">
				<p v-if="action.description" class="text-text-secondary font-theme">{{ t(action.description) }}</p>

				<div class="flex-1" />

				<p class="text-text-secondary font-theme">{{ action.keyBinding ?? t('Unbound') }}</p>
			</div>
		</div>
	</div>
</template>

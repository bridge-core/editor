<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import IconButton from '@/components/Common/IconButton.vue'
import { useTranslate } from '@/libs/locales/Locales'

const t = useTranslate()
const actions = [
	<Action>{
		icon: 'help',
		label: 'Help',
		description: 'Helps you in some way.',
		onClick: () => {
			console.log('test')
		},
	},
	<Action>{
		icon: 'box',
		label: 'Box',
		description: "It's a box.",
		onClick: () => {
			console.log('test2')
		},
	},
] //Placeholder

export interface Action {
	label: string
	icon: string
	description: string
	onClick: Function
}
</script>
<template>
	<div class="flex-col w-full">
		<div v-for="action in actions" class="text-normal p-4 mb-2 rounded card bg-background-secondary w-full">
			<div class="flex w-full h-full">
				<Icon class="mr-1 content-center" style="color: var(--theme-color-primary)" :icon="action.icon" />
				<h3 class="text-lg font-medium">{{ action.label }}</h3>
				<div class="w-full" />
				<IconButton class="content-center" icon="play" @click="action.onClick" />
				<!-- Setup keybinds here? -->
			</div>
			<p>{{ action.description }}</p>
		</div>
	</div>
</template>

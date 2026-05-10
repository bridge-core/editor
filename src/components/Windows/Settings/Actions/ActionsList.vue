<script setup lang="ts">
import Icon from '@/components/Common/Icon.vue'
import IconButton from '@/components/Common/IconButton.vue'
import { useTranslate } from '@/libs/locales/Locales'
import { useActions } from '@/libs/actions/ActionManager'
import { Action } from '@/libs/actions/Action'
import { computed, ComputedRef, onUnmounted, Ref, ref } from 'vue'

const t = useTranslate()

const actions = useActions()

const categorizedActions: ComputedRef<Record<string, Action[]>> = computed(() => {
	let categories: Record<string, Action[]> = {}

	for (const [id, action] of Object.entries(actions.value)) {
		if (!categories[action.category]) categories[action.category] = []

		categories[action.category].push(action)
	}

	return categories
})

const currentlyRebindingAction: Ref<string | null> = ref(null)

let cancelRebind: (() => void) | null = null

function rebind(action: Action) {
	Action.disabledAll()

	if (cancelRebind) cancelRebind()

	currentlyRebindingAction.value = action.id

	const listener = (event: KeyboardEvent) => {
		event.preventDefault()

		if (event.key.toUpperCase() === 'CONTROL') return
		if (event.key.toUpperCase() === 'SHIFT') return
		if (event.key.toUpperCase() === 'ALT') return

		if (event.key.toUpperCase() === 'ESCAPE') {
			action.unbind()

			window.removeEventListener('keydown', listener)

			cancelRebind = null

			Action.enableAll()

			currentlyRebindingAction.value = null

			return
		}

		const ctrlModifier = event.ctrlKey
		const shiftModifier = event.shiftKey
		const altModifier = event.altKey
		const key = event.key.toUpperCase()

		action.rebind(key, ctrlModifier, shiftModifier, altModifier)

		window.removeEventListener('keydown', listener)

		cancelRebind = null

		Action.enableAll()

		currentlyRebindingAction.value = null
	}

	cancelRebind = () => {
		window.removeEventListener('keydown', listener)

		cancelRebind = null

		Action.enableAll()

		currentlyRebindingAction.value = null
	}

	window.addEventListener('keydown', listener)
}

onUnmounted(() => {
	if (cancelRebind) cancelRebind()
})
</script>
<template>
	<div class="flex flex-col gap-8 w-full">
		<div v-for="category in Object.keys(categorizedActions)" class="w-full">
			<h2 class="font-theme text-xl font-bold mb-1">{{ t(category) }}</h2>

			<div class="flex flex-col gap-3 w-full">
				<div v-for="action in categorizedActions[category]" class="text-normal p-2 rounded bg-background-secondary w-full">
					<div class="flex w-full mb-2">
						<Icon v-if="action.icon" class="mr-1 content-center" style="color: var(--theme-color-primary)" :icon="action.icon" />

						<h3 class="text-lg font-medium w-full font-theme">{{ action.name ? t(action.name) : action.id }}</h3>

						<div class="flex-1" />

						<IconButton v-if="!action.requiresContext" class="content-center" icon="play_arrow" @click="action.trigger()" :enabled="action.visible" />
					</div>

					<div class="flex w-full">
						<p v-if="action.description" class="text-text-secondary font-theme">{{ t(action.description) }}</p>

						<div class="flex-1" />

						<p class="text-text-secondary font-theme cursor-pointer min-w-max" @click="rebind(action)">
							{{ currentlyRebindingAction === action.id ? t('actions.rebinding') : action.keyBinding ?? t('actions.unbound') }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

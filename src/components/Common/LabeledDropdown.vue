<script setup lang="ts">
import LabeledInput from './LabeledInput.vue'
import Dropdown from './Dropdown.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { onUnmounted, Ref, ref } from 'vue'
import IconButton from './IconButton.vue'
import { isElementOrChild } from '@/libs/element/Element'

const t = useTranslate()

const props = defineProps<{
	label: string
	options: string[]
	borderColor?: string
	updateAlways?: boolean
}>()

const emit = defineEmits<{
	submit: [value: string]
}>()

const [model, modifiers] = defineModel<string>()

const parent: Ref<HTMLDivElement | null> = ref(null)
const labeledInput: Ref<typeof LabeledInput | null> = ref(null)

const expanded = ref(false)

function click(event: Event) {
	if (!parent.value) return
	if (event.target && !(event.target instanceof HTMLElement)) return

	if (isElementOrChild(event.target, parent.value)) return

	expanded.value = false

	window.removeEventListener('mousedown', click)

	labeledInput.value?.blur()
}

function interact(focus: () => void) {
	focus()

	expanded.value = true

	window.addEventListener('mousedown', click)
}

function submit(item: { id: any; label: string }) {
	labeledInput.value?.blur()

	emit('submit', props.options[item.id])

	model.value = item.label

	window.removeEventListener('mousedown', click)
}

onUnmounted(() => {
	if (!expanded.value) return

	window.removeEventListener('mousedown', click)
})
</script>

<template>
	<div ref="parent">
		<LabeledInput
			ref="labeledInput"
			v-slot="{ focus }"
			:label="t(label)"
			class="bg-background flex-1"
			:border-color="borderColor"
		>
			<div class="flex gap-1">
				<p @click="interact(focus)" class="font-inter flex-1">{{ model }}</p>

				<IconButton
					icon="arrow_drop_down"
					class="ml-auto transition-transform duration-200 ease-out"
					:class="{ '-rotate-180': expanded }"
					@click="interact(focus)"
				/>
			</div>
		</LabeledInput>

		<Dropdown
			v-if="options.length > 0"
			class="mb-4 flex-1"
			v-model="expanded"
			:parent
			:items="options.map((option, index) => ({ id: index, label: option }))"
			@selected="submit"
		/>
	</div>
</template>

<style scoped>
.light-scroll::-webkit-scrollbar-thumb {
	background-color: var(--theme-color-backgroundTertiary);
}
</style>

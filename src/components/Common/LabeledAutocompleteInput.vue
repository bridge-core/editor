<script setup lang="ts">
import LabeledInput from './LabeledInput.vue'
import Dropdown from './Dropdown.vue'

import { useTranslate } from '@/libs/locales/Locales'
import { CompletionItem } from '@/libs/jsonSchema/Schema'
import { onUnmounted, Ref, ref } from 'vue'
import IconButton from './IconButton.vue'
import { isElementOrChild } from '@/libs/element/Element'

const t = useTranslate()

const props = defineProps<{
	label: string
	completions: CompletionItem[]
	borderColor?: string
}>()

const emit = defineEmits<{
	complete: [completion: CompletionItem]
	submit: [value: string]
}>()

const [model, modifiers] = defineModel<string>()

const parent: Ref<HTMLDivElement | null> = ref(null)
const labeledInput: Ref<typeof LabeledInput | null> = ref(null)
const inputElement: Ref<HTMLInputElement | null> = ref(null)

const expanded = ref(false)

function click(event: Event) {
	if (!parent.value) return
	if (!inputElement.value) return
	if (event.target && !(event.target instanceof HTMLElement)) return

	if (isElementOrChild(event.target, parent.value)) return

	expanded.value = false

	model.value = inputElement.value.value

	labeledInput.value?.blur()
}

function interact(focus: () => void) {
	focus()

	expanded.value = true

	window.addEventListener('mousedown', click)
}

function completion(item: { id: any; label: string }) {
	if (!inputElement.value) return

	labeledInput.value?.blur()

	emit('complete', props.completions[item.id])

	model.value = item.label

	window.removeEventListener('mousedown', click)
}

function enter(event: KeyboardEvent) {
	if (!inputElement.value) return
	if (event.key !== 'Enter') return

	labeledInput.value?.blur()

	const inputValue = inputElement.value.value

	emit('submit', inputValue)

	model.value = inputValue

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
				<input
					ref="inputElement"
					@focus="interact(focus)"
					class="outline-none border-none bg-transparent font-inter flex-1"
					:value="model"
					@keyup="enter"
				/>

				<IconButton
					icon="arrow_drop_down"
					class="ml-auto transition-transform duration-200 ease-out"
					:class="{ '-rotate-180': expanded }"
					@click="interact(focus)"
				/>
			</div>
		</LabeledInput>

		<Dropdown
			class="mb-4 flex-1"
			v-model="expanded"
			:parent
			:items="completions.map((completion, index) => ({ id: index, label: completion.label }))"
			@selected="completion"
		/>
	</div>
</template>

<style scoped>
.light-scroll::-webkit-scrollbar-thumb {
	background-color: var(--theme-color-backgroundTertiary);
}
</style>

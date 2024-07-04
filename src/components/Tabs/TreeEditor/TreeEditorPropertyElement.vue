<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import TreeEditorValueElement from './TreeEditorValueElement.vue'
import TreeEditorObjectElement from './TreeEditorContainerElement.vue'
import HighlightedText from './HighlightedText.vue'

import { ref } from 'vue'
import { TreeEditorTab } from './TreeEditorTab'
import { TreeElement, ObjectElement } from './Tree'

const { tree, name, editor }: { tree: TreeElement; name: string; editor: TreeEditorTab } = <any>defineProps({
	editor: {
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	tree: {
		type: TreeElement,
		required: true,
	},
})

const open = ref(false)

function click() {
	editor.select(name, tree)

	if (!(tree instanceof ObjectElement)) return

	open.value = !open.value
}
</script>

<template>
	<div class="table">
		<span class="flex items-end gap-2">
			<span
				class="flex items-center gap-1 bg-[var(--color)] hover:bg-background-secondary px-1 rounded transition-colors ease-out duration-100 cursor-pointer"
				@click="click"
				:style="{
					'--color':
						//Proxies don't equal eachother so we use an uuid
						editor.selectedTree.value?.tree?.id === tree.id
							? 'var(--theme-color-backgroundSecondary)'
							: 'none',
				}"
			>
				<Icon
					icon="chevron_right"
					class="text-base transition-rotate ease-out duration-100"
					:style="{
						rotate: open ? '90deg' : 'none',
					}"
					:color="tree instanceof ObjectElement ? 'text' : 'textSecondary'"
				/>

				<span class="select-none" :style="{ fontFamily: 'Consolas' }">
					"<HighlightedText
						:known-words="(editor as TreeEditorTab).knownWords"
						:value="name"
						type="string"
					/>":
				</span>
			</span>

			<TreeEditorValueElement v-if="!open" :editor="editor" :tree="tree" @click="click" />
			<span v-else class="select-none">{</span>
		</span>
	</div>
	<div v-if="open">
		<div class="ml-4">
			<TreeEditorObjectElement :editor="editor" :tree="tree" />
		</div>

		<span class="ml-2 select-none">}</span>
	</div>
</template>

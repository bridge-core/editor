<script lang="ts" setup>
import TreeEditorPropertyElement from './TreeEditorPropertyElement.vue'
import { ObjectElement, TreeElement } from './Tree'

defineProps({
	editor: {
		required: true,
	},
	tree: {
		type: TreeElement,
		required: true,
	},
})
</script>

<template>
	<div v-if="tree instanceof ObjectElement">
		<TreeEditorPropertyElement
			:editor="editor"
			v-for="key in Object.keys(tree.children)"
			:property-key="key"
			:tree="tree.children[key]"
		/>
	</div>
</template>

<script lang="ts" setup>
import TreeEditorPropertyElement from './TreeEditorPropertyElement.vue'
import { ArrayElement, ObjectElement, TreeElement } from '../Tree'
import { TreeEditorTab } from '../TreeEditorTab'

defineProps<{ tree: TreeElement; editor: TreeEditorTab }>()
</script>

<template>
	<div v-if="tree instanceof ObjectElement">
		<TreeEditorPropertyElement
			:editor="editor"
			v-for="key in Object.keys(tree.children)"
			:element-key="key"
			:tree="tree.children[key]"
			:key="tree.children[key].id"
		/>
	</div>

	<div v-if="tree instanceof ArrayElement">
		<TreeEditorPropertyElement
			:editor="editor"
			v-for="(value, index) in tree.children"
			:element-key="index"
			:tree="tree.children[index]"
			:key="tree.children[index].id"
		/>
	</div>
</template>

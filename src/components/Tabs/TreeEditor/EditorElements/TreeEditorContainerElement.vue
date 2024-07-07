<script lang="ts" setup>
import TreeEditorPropertyElement from './TreeEditorPropertyElement.vue'
import { ArrayElement, ObjectElement, TreeElement } from '../Tree'
import { TreeEditorTab } from '../TreeEditorTab'
import { computed, onRenderTriggered } from 'vue'

const props = defineProps<{ tree: TreeElement; editor: TreeEditorTab }>()

const keys = computed(() => (props.tree instanceof ObjectElement ? Object.keys(props.tree.children) : []))
</script>

<template>
	<div v-if="tree instanceof ObjectElement">
		<TreeEditorPropertyElement
			:editor="editor"
			v-for="key in keys"
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

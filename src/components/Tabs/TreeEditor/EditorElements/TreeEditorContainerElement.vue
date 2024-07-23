<script lang="ts" setup>
import TreeEditorPropertyElement from './TreeEditorPropertyElement.vue'
import { ArrayElement, ObjectElement, TreeElements } from '../Tree'
import { TreeEditorTab } from '../TreeEditorTab'
import { computed } from 'vue'

const props = defineProps<{ tree: TreeElements; editor: TreeEditorTab }>()

const emit = defineEmits(['opencontextmenu'])

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
			@opencontextmenu="(event) => emit('opencontextmenu', event)"
		/>
	</div>

	<div v-if="tree instanceof ArrayElement">
		<TreeEditorPropertyElement
			:editor="editor"
			v-for="(value, index) in tree.children"
			:element-key="index"
			:tree="tree.children[index]"
			:key="tree.children[index].id"
			@opencontextmenu="(event) => emit('opencontextmenu', event)"
		/>
	</div>
</template>

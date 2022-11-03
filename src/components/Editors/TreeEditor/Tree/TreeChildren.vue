<template>
	<div class="pl-4">
		<Draggable
			v-model="children"
			:group="{
				name: 'treeEditorNode',
			}"
			:disabled="!dragAndDropEnabled || pointerDevice === 'touch'"
			@change="onChange"
		>
			<component
				v-for="[key, child] in children"
				:key="child.uuid"
				:is="child.component"
				:tree="child"
				:treeEditor="treeEditor"
				@setActive="$emit('setActive')"
			>
				<span v-if="tree.type === 'array'" :style="numberDef">{{
					key
				}}</span>
				<Highlight v-else :value="key" />
			</component>
		</Draggable>
	</div>
</template>

<script>
import Highlight from '../Highlight.vue'
import { ArrayTree } from './ArrayTree.ts'
import { pointerDevice } from '/@/utils/pointerDevice.ts'
import Draggable from 'vuedraggable'
import { settingsState } from '/@/components/Windows/Settings/SettingsState.ts'
import { MoveEntry } from '../History/MoveEntry.ts'
import { HighlighterMixin } from '/@/components/Mixins/Highlighter'

export default {
	name: 'TreeChildren',
	mixins: [HighlighterMixin(['number'])],
	components: {
		Highlight,
		Draggable,
	},
	props: {
		tree: Object,
		treeEditor: Object,
	},
	setup() {
		return { pointerDevice }
	},
	methods: {
		wrapKey(key) {
			return this.tree.type === 'object' ? `"${key}"` : `${key}`
		},
		onChange(event) {
			if (event.removed || event.moved) {
				const tree = event.removed
					? event.removed.element[1]
					: event.moved.element[1]
				const oldIndex = event.removed
					? event.removed.oldIndex
					: event.moved.oldIndex

				this.treeEditor.history.push(
					new MoveEntry(this.tree, tree, oldIndex, tree.key)
				)
			} else if (event.added) {
				event.added.element[1].parent = this.tree
			}
		},
	},
	computed: {
		dragAndDropEnabled() {
			return settingsState.editor?.dragAndDropTreeNodes ?? true
		},
		children: {
			get() {
				if (this.tree instanceof ArrayTree)
					return Object.entries(this.tree.children)
				else return this.tree.children
			},
			set(val) {
				if (this.tree instanceof ArrayTree)
					this.tree._children = val.map((item) => item[1])
				else this.tree._children = val
			},
		},
	},
}
</script>

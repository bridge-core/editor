<template>
	<div class="pl-4">
		<Draggable
			v-model="children"
			:group="{
				name: 'treeEditorNode',
			}"
			:disabled="!dragAndDropEnabled || pointerDevice === 'touch'"
		>
			<component
				v-for="[key, child] in children"
				:key="child.uuid"
				:is="child.component"
				:tree="child"
				:treeEditor="treeEditor"
				@setActive="$emit('setActive')"
			>
				<Highlight :value="key"></Highlight>
			</component>
		</Draggable>
	</div>
</template>

<script>
import Highlight from '../Highlight.vue'
import { ArrayTree } from './ArrayTree'
import { pointerDevice } from '/@/utils/pointerDevice'
import Draggable from 'vuedraggable'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'

export default {
	name: 'TreeChildren',
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

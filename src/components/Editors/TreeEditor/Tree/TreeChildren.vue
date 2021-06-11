<template>
	<div class="pl-4">
		<component
			v-for="(child, key) in children"
			:key="child.uuid"
			:is="child.component"
			:tree="child"
			:treeEditor="treeEditor"
		>
			<Highlight :def="tree.type === 'object' ? stringDef : numberDef">{{
				wrapKey(key)
			}}</Highlight>
		</component>
	</div>
</template>

<script>
import { HighlighterMixin } from '/@/components/Mixins/Highlighter.ts'
import Highlight from '../Highlight.vue'
import { ArrayTree } from './ArrayTree'

export default {
	name: 'TreeChildren',
	mixins: [HighlighterMixin(['string', 'number'])],
	components: {
		Highlight,
	},
	props: {
		tree: Object,
		treeEditor: Object,
	},
	methods: {
		wrapKey(key) {
			return this.tree.type === 'object' ? `"${key}"` : `${key}`
		},
	},
	computed: {
		children() {
			if (this.tree instanceof ArrayTree) return this.tree.children
			else return Object.fromEntries(this.tree.children)
		},
	},
}
</script>

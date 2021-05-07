<template>
	<div class="pl-4">
		<component
			v-for="(child, key) in tree.children"
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
}
</script>

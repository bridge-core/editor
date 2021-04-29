<template>
	<div :style="tree.styles">
		<span v-if="tree.parent.type === 'object'"><slot />:</span>
		<span
			:style="{
				color: highlighterInfo.color,
				backgroundColor: highlighterInfo.background,
				textDecoration,
			}"
		>
			{{ treeValue }}
		</span>
	</div>
</template>

<script>
import { HighlighterMixin } from '/@/components/Mixins/Highlighter'

export default {
	name: 'PrimitiveTree',
	mixins: [HighlighterMixin(['atom', 'string', 'number'])],
	props: {
		tree: Object,
	},
	computed: {
		treeValue() {
			if (this.tree.type === 'string') return `"${this.tree.value}"`
			return this.tree.value
		},
		highlighterInfoDef() {
			switch (this.tree.type) {
				case 'number':
					return 'numberDef'
				case 'string':
					return 'stringDef'
				case 'boolean':
					return 'atomDef'
				default:
					throw new Error(
						`Unknown primitive type: "${this.tree.type}"`
					)
			}
		},
		highlighterInfo() {
			return this[this.highlighterInfoDef]
		},
		textDecoration() {
			if (!this.highlighterInfo.textDecoration)
				this.highlighterInfo.textDecoration = ''

			if (this.highlighterInfo.isItalic)
				this.highlighterInfo.textDecoration += ' italic'
			return this.highlighterInfo.textDecoration
		},
	},
}
</script>

<style></style>

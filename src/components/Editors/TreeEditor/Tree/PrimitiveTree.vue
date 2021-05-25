<template>
	<div :style="tree.styles">
		<span v-if="tree.parent.type === 'object'">
			<span @click.stop.prevent="onClickKey"><slot /></span>:</span
		>

		<!-- Debugging helper -->
		<span v-if="isDevMode">
			s: {{ tree.type }} p: {{ tree.parent.type }}</span
		>

		<span
			:style="{
				color: highlighterInfo.color,
				backgroundColor: highlighterInfo.background,
				textDecoration,
			}"
			:class="{
				'tree-editor-selection': tree.isValueSelected,
				'ml-1': true,
			}"
			@click.stop.prevent="onClickKey($event, true)"
			>{{ treeValue }}</span
		>
	</div>
</template>

<script>
import { DevModeMixin } from '/@/components/Mixins/DevMode'
import { HighlighterMixin } from '/@/components/Mixins/Highlighter'

export default {
	name: 'PrimitiveTree',
	mixins: [HighlighterMixin(['atom', 'string', 'number']), DevModeMixin],
	props: {
		tree: Object,
		treeEditor: Object,
	},
	computed: {
		treeValue() {
			if (this.tree.value === null) return 'null'
			else if (this.tree.type === 'string') return `"${this.tree.value}"`
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
				case 'null':
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
	methods: {
		onClickKey(event, selectValue) {
			if (event.altKey)
				this.treeEditor.toggleSelection(this.tree, selectValue)
			else this.treeEditor.setSelection(this.tree, selectValue)
		},
	},
}
</script>

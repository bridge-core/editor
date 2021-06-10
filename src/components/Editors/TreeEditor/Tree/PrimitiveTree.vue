<template>
	<div tabindex="-1" :style="tree.styles">
		<div
			style="display: inline-block"
			:class="{
				'tree-editor-selection':
					tree.type !== 'object' &&
					tree.type !== 'array' &&
					tree.isSelected,
			}"
		>
			<v-icon class="mr-1 pb-1" :style="{ opacity: '60%' }" small>
				mdi-chevron-right
			</v-icon>
			<span v-if="tree.parent.type === 'object'">
				<span @click.stop.prevent="onClickKey"><slot /></span>:</span
			>
		</div>

		<!-- Debugging helper -->
		<span v-if="isDevMode">
			s: {{ tree.type }} p: {{ tree.parent.type }}</span
		>

		<div
			:style="{
				height: '20.5px',
				display: 'inline-block',
				color: highlighterInfo.color,
				backgroundColor: highlighterInfo.background,
				textDecoration,
			}"
			:class="{
				'tree-editor-selection': tree.isValueSelected,
				'px-1': true,
			}"
			@click.stop.prevent="onClickKey($event, true)"
		>
			{{ treeValue }}
		</div>
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

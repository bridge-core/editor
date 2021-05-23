<template>
	<div>
		<div
			class="pr-4 code-font"
			:style="`height: ${height - 56}px; overflow: auto;`"
		>
			<component
				:is="tab.treeEditor.tree.component"
				:tree="tab.treeEditor.tree"
				:treeEditor="tab.treeEditor"
			/>
		</div>

		<div class="d-flex px-4">
			<v-combobox label="Add Object" outlined dense hide-details />
			<v-combobox
				class="mx-4"
				label="Add Value"
				outlined
				dense
				hide-details
			/>
			<v-text-field
				label="Edit"
				:value="currentValue"
				@change="onEdit"
				outlined
				dense
				hide-details
			/>
		</div>
	</div>
</template>

<script>
import { TreeValueSelection } from './TreeSelection'
export default {
	name: 'TreeTab',
	props: {
		tab: Object,
		height: Number,
	},
	computed: {
		treeEditor() {
			return this.tab.treeEditor
		},
		currentValue() {
			let first = undefined
			this.treeEditor.forEachSelection((selection) => {
				let current
				if (selection instanceof TreeValueSelection)
					current = selection.getTree().value
				else current = selection.getTree().key

				if (first === undefined) {
					first = current
				} else if (first !== current) {
					first = ''
				}
			})

			return first
		},
	},
	methods: {
		onEdit(value) {
			console.log(value)
			this.treeEditor.forEachSelection((selection) => {
				console.log(selection)
				selection.edit(value)
			})
		},
	},
}
</script>

<style>
.tree-editor-selection {
	outline: 1px solid white;
}
</style>

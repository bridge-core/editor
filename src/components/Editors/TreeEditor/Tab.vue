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
			<v-combobox
				ref="addKeyInput"
				v-model="keyToAdd"
				@change="onAddKey"
				:label="t('editors.treeEditor.addObject')"
				outlined
				dense
				hide-details
			/>
			<v-combobox
				ref="addValueInput"
				v-model="valueToAdd"
				@change="onAddValue"
				class="mx-4"
				:label="t('editors.treeEditor.addValue')"
				outlined
				dense
				hide-details
			/>
			<v-text-field
				ref="editValueInput"
				:value="currentValue"
				@change="onEdit"
				:label="t('editors.treeEditor.edit')"
				outlined
				dense
				hide-details
			/>
		</div>
	</div>
</template>

<script>
import { TranslationMixin } from '../../Mixins/TranslationMixin'
import { TreeValueSelection } from './TreeSelection'

export default {
	name: 'TreeTab',
	mixins: [TranslationMixin],
	props: {
		tab: Object,
		height: Number,
	},
	data: () => ({
		keyToAdd: '',
		valueToAdd: '',
	}),
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
		onAddKey(value) {
			if (value === null) return

			console.log(value)
			this.treeEditor.forEachSelection((selection) => {
				if (selection instanceof TreeValueSelection) return

				selection.addKey(value)
			})

			this.$nextTick(() => (this.keyToAdd = ''))
		},
		onAddValue(value) {
			if (value === null) return

			if (!Number.isNaN(Number(value))) value = Number(value)
			else if (value === 'null') value = null
			else if (value === 'true' || value === 'false')
				value = value === 'true'

			this.treeEditor.forEachSelection((selection) => {
				if (selection instanceof TreeValueSelection) return

				selection.addValue(value)
			})

			this.$nextTick(() => (this.valueToAdd = ''))
		},
	},
}
</script>

<style>
.tree-editor-selection {
	outline: 1px solid white;
}
</style>

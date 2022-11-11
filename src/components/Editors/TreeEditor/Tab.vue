<template>
	<div
		class="editor-container"
		:style="{ fontSize, fontFamily: codeFontFamily }"
		ref="editorContainer"
		@click="tab.parent.setActive(true)"
		tabindex="-1"
	>
		<!-- Bar showing the current location of a user within the file -->
		<div
			v-if="shouldShowLocationBar && currentSelectionPath.length > 1"
			class="tree-editor-navigation lineHighlightBackground rounded px-1 mx-3 mt-1 mb-2"
		>
			<template v-for="(pathPart, i) in currentSelectionPath">
				<Highlight
					class="cursor-pointer"
					@click.native="
						selectTreePath(currentSelectionPath.slice(0, i + 1))
					"
					:value="`${pathPart}`"
					:key="i"
				/>
				<v-icon
					v-if="i + 1 < currentSelectionPath.length"
					:key="`next-icon-${i}`"
					small
				>
					mdi-chevron-right
				</v-icon>
			</template>
		</div>

		<div
			class="pr-4"
			:style="`height: ${
				height - !tab.isReadOnly * 194
			}px; overflow: auto;`"
			@blur="focusEditor"
			@scroll="onScroll"
			@contextmenu.prevent.stop="tab.treeEditor.onPasteMenu($event)"
		>
			<component
				:is="tab.treeEditor.tree.component"
				:tree="tab.treeEditor.tree"
				:treeEditor="tab.treeEditor"
				@setActive="tab.parent.setActive(true)"
			/>
		</div>

		<v-divider v-if="!tab.isReadOnly" class="mb-4" />

		<div
			v-if="!tab.isReadOnly"
			class="d-flex px-4"
			:style="{ fontFamily }"
			@blur="focusEditor"
		>
			<v-combobox
				ref="addKeyInput"
				v-model="keyToAdd"
				@change="onAdd"
				@keydown.enter="mayTrigger"
				@keydown.tab="mayTrigger"
				:items="
					isUsingBridgePredictions
						? allSuggestions
						: propertySuggestions
				"
				:item-value="(item) => item"
				:menu-props="{
					maxHeight: 124,
					top: false,
					contentClass: 'json-editor-suggestions-menu',
					rounded: 'lg',
					'nudge-top': -8,
					transition: 'slide-y-transition',
				}"
				:label="
					isUsingBridgePredictions
						? t('editors.treeEditor.add')
						: t('editors.treeEditor.addObject')
				"
				outlined
				dense
				hide-details
				enterkeyhint="enter"
			>
				<template v-slot:item="{ item }">
					<div style="width: 100%" @click="mayTrigger">
						<v-icon class="mr-1" color="primary" small>
							{{ getIcon(item) }}
						</v-icon>
						<span
							style="
								font-size: 0.8125rem;
								font-weight: 500;
								line-height: 1rem;
							"
						>
							{{ item.label }}
						</span>
					</div>
				</template>
			</v-combobox>
			<v-tooltip v-if="isUsingBridgePredictions" color="tooltip" bottom>
				<template v-slot:activator="{ on }">
					<v-btn v-on="on" @click="forceValue" class="mx-4">
						<v-icon>mdi-alphabetical</v-icon>
					</v-btn>
				</template>
				<span>{{ t('editors.treeEditor.forceValue') }}</span>
			</v-tooltip>

			<v-combobox
				v-else
				ref="addValueInput"
				v-model="valueToAdd"
				@change="(s) => onAdd(s, true)"
				@keydown.enter="mayTrigger"
				@keydown.tab="mayTrigger"
				:disabled="isGlobal"
				:items="valueSuggestions"
				:item-value="(item) => item"
				:menu-props="{
					maxHeight: 124,
					top: false,
					contentClass: 'json-editor-suggestions-menu',
					rounded: 'lg',
					'nudge-top': -8,
					transition: 'slide-y-transition',
				}"
				:label="t('editors.treeEditor.addValue')"
				class="mx-4"
				outlined
				dense
				hide-details
				enterkeyhint="enter"
			>
				<template v-slot:item="{ item }">
					<div style="width: 100%" @click="mayTrigger">
						<v-icon class="mr-1" color="primary" small>
							{{ getIcon(item) }}
						</v-icon>
						<span
							style="
								font-size: 0.8125rem;
								font-weight: 500;
								line-height: 1rem;
							"
						>
							{{ item.label }}
						</span>
					</div>
				</template>
			</v-combobox>
			<v-combobox
				ref="editValueInput"
				:value="
					currentValue === undefined ? undefined : `${currentValue}`
				"
				@change="(s) => onEdit(s)"
				@keydown.enter="mayTrigger"
				@keydown.tab="mayTrigger"
				:disabled="isGlobal"
				:items="editSuggestions"
				:item-value="(item) => item"
				:menu-props="{
					maxHeight: 124,
					top: false,
					contentClass: 'json-editor-suggestions-menu',
					rounded: 'lg',
					'nudge-top': -8,
					transition: 'slide-y-transition',
				}"
				:label="t('editors.treeEditor.edit')"
				outlined
				dense
				hide-details
				enterkeyhint="enter"
			>
				<template v-slot:item="{ item }">
					<div style="width: 100%" @click="mayTrigger">
						<v-icon class="mr-1" color="primary" small>
							{{ getIcon(item) }}
						</v-icon>
						<span
							style="
								font-size: 0.8125rem;
								font-weight: 500;
								line-height: 1rem;
							"
						>
							{{ item.label }}
						</span>
					</div>
				</template>
			</v-combobox>
		</div>
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { TreeValueSelection } from './TreeSelection'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import { inferType } from '/@/utils/inferType'
import { mayCastTo } from './mayCastTo'
import Highlight from './Highlight.vue'

export default {
	name: 'TreeTab',
	mixins: [TranslationMixin],
	components: {
		Highlight,
	},
	props: {
		tab: Object,
		height: Number,
	},
	data: () => ({
		keyToAdd: '',
		valueToAdd: '',
		pressedShift: false,
		triggerCooldown: false,
		isUserControlledTrigger: false,
	}),
	mounted() {
		this.treeEditor.receiveContainer(this.$refs.editorContainer)
	},
	activated() {
		this.treeEditor.receiveContainer(this.$refs.editorContainer)
	},
	computed: {
		isUsingBridgePredictions() {
			return settingsState?.editor?.bridgePredictions ?? true
		},
		fontSize() {
			return settingsState &&
				settingsState.appearance &&
				settingsState.appearance.editorFontSize
				? `${settingsState.appearance.editorFontSize}`
				: '14px'
		},
		codeFontFamily() {
			return settingsState &&
				settingsState.appearance &&
				settingsState.appearance.editorFont
				? `${settingsState.appearance.editorFont}, monospace !important`
				: 'Menlo, monospace !important'
		},
		fontFamily() {
			return this.settingsState &&
				this.settingsState.appearance &&
				this.settingsState.appearance.font
				? `${this.settingsState.appearance.font} !important`
				: 'Roboto !important'
		},
		treeEditor() {
			return this.tab.treeEditor
		},
		currentValue() {
			let first = undefined
			this.treeEditor.forEachSelection((selection) => {
				if (!selection.getTree().parent) return

				let current
				try {
					if (selection instanceof TreeValueSelection)
						current = selection.getTree().value
					else current = selection.getTree().key
				} catch {}

				if (first === undefined) {
					first = current
				} else if (first !== current) {
					first = ''
				}
			})

			return first
		},
		isGlobal() {
			let isGlobal = false
			this.treeEditor.forEachSelection((selection) => {
				if (isGlobal) return
				if (!selection.getTree().parent) {
					isGlobal = true
				}
			})

			return isGlobal
		},
		propertySuggestions() {
			return this.treeEditor.propertySuggestions.map((suggestion) => ({
				...suggestion,
				text: suggestion.value,
			}))
		},
		valueSuggestions() {
			return this.treeEditor.valueSuggestions.map((suggestion) => ({
				...suggestion,
				text: suggestion.value,
			}))
		},
		editSuggestions() {
			return this.treeEditor.editSuggestions.map((suggestion) => ({
				...suggestion,
				text: suggestion.value,
			}))
		},
		allSuggestions() {
			return this.propertySuggestions.concat(this.valueSuggestions)
		},
		currentSelectionPath() {
			const selection = this.treeEditor.selections[0]
			if (!selection) return []

			return selection.getTree().path
		},
		shouldShowLocationBar() {
			if (
				!settingsState ||
				!settingsState.editor ||
				settingsState.editor.showTreeEditorLocationBar === undefined
			)
				return true //Default value for setting is "true"
			return settingsState.editor.showTreeEditorLocationBar
		},
	},
	methods: {
		focusEditor() {
			if (this.$refs.editorContainer) this.$refs.editorContainer.focus()
		},
		onEdit(suggestion) {
			if (typeof suggestion !== 'string') suggestion = suggestion.value

			this.treeEditor.edit(`${suggestion}`)
		},
		onAdd(suggestion, forceValue = false) {
			if (this.triggerCooldown || !this.isUserControlledTrigger) {
				if (!this.isUserControlledTrigger)
					this.$nextTick(() => {
						this.keyToAdd = ''
						this.valueToAdd = ''
					})
				this.pressedShift = false
				return
			}

			if (!suggestion) {
				this.pressedShift = false
				return this.onTriggerCooldown()
			}

			let forcedValueType = undefined

			if (forceValue) this.pressedShift = true
			else if (typeof suggestion === 'string') {
				// 1. Can we find the new value inside of the suggestions?
				const validSuggestion = this.allSuggestions.find(
					({ label }) => label === suggestion
				)
				// Use the first valid suggestion if it exists
				if (validSuggestion) {
					suggestion = validSuggestion
				} else {
					// 2. No valid suggestion found, infer the suggestion type
					// Logic for infering whether an unknown value should be treated as a key or a value
					const castedValue = inferType(suggestion)
					// Make sure we differentiate between a decimal number and an integer
					const castedType =
						typeof castedValue === 'number'
							? suggestion.includes('.')
								? 'number'
								: 'integer'
							: typeof castedValue

					// Get valid value types for current schemas
					const types = this.treeEditor.getSchemaTypes()

					if (
						// Is the current type a valid type...
						types.has(castedType) ||
						// ...or can we cast it to a valid type?
						mayCastTo[castedType].some((type) => {
							if (types.has(type)) {
								forcedValueType = type
								return true
							}
						})
					) {
						// Force add the input as a value
						this.pressedShift = true
					}
				}
			}
			const {
				type = this.pressedShift ? 'value' : 'object',
				value = suggestion,
			} = suggestion
			this.pressedShift = false

			if (type === 'snippet') {
				this.treeEditor.addFromJSON(value[1])
			} else if (type === 'object' || type === 'array') {
				this.treeEditor.addKey(value, type)
			} else if (type === 'value') {
				this.treeEditor.addValue(value, type, forcedValueType)
			} else {
				console.error(`Unknown suggestion type: "${type}"`)
			}

			this.$nextTick(() => {
				this.keyToAdd = ''
				this.valueToAdd = ''
			})

			this.onTriggerCooldown()
		},
		onTriggerCooldown() {
			if (this.triggerCooldown) return

			setTimeout(() => {
				this.triggerCooldown = false
			}, 100)
			this.triggerCooldown = true
		},
		mayTrigger(event) {
			this.pressedShift = event.shiftKey

			if (this.isUserControlledTrigger) return

			setTimeout(() => {
				this.isUserControlledTrigger = false
			}, 100)
			this.isUserControlledTrigger = true
		},
		forceValue() {
			this.$refs.addKeyInput.blur()

			// keyToAdd model only updates after input being blurred
			this.$nextTick(() => {
				this.isUserControlledTrigger = true
				this.onAdd(this.keyToAdd, true)
			})
		},
		onScroll(event) {
			this.treeEditor.scrollTop = event.target.scrollTop
		},
		getIcon(item) {
			switch (item.type) {
				case 'object':
					return 'mdi-code-json'
				case 'array':
					return 'mdi-code-brackets'

				case 'value':
					return 'mdi-alphabetical'
				case 'arrayValue':
					return 'mdi-link-variant'
				case 'snippet':
					return 'mdi-attachment'
				default:
					return 'mdi-text'
			}
		},

		selectTreePath(path) {
			const tree = this.treeEditor.tree.get(path)
			if (!tree) return

			this.treeEditor.setSelection(tree)

			setTimeout(() => {
				document
					.getElementsByClassName('tree-editor-selection')[0]
					.scrollIntoView({
						behavior: 'smooth',
					})
			}, 100)
		},
	},
	watch: {
		'tab.uuid'() {
			this.treeEditor.receiveContainer(this.$refs.editorContainer)
		},
		propertySuggestions() {
			if (
				this.isUsingBridgePredictions &&
				this.propertySuggestions.length > 0
			) {
				this.$refs.addKeyInput.focus()

				return
			}
			if (
				!this.$refs.addKeyInput ||
				!this.$refs.addValueInput ||
				!this.$refs.editValueInput
			)
				return

			if (
				this.propertySuggestions.length === 0 &&
				this.valueSuggestions.length > 0
			) {
				this.$refs.editValueInput.blur()
				this.$refs.addKeyInput.blur()
				this.$refs.addValueInput.focus()
			} else if (this.propertySuggestions.length > 0) {
				this.$refs.editValueInput.blur()
				this.$refs.addValueInput.blur()
				this.$refs.addKeyInput.focus()
			} else if (
				this.treeEditor.selections.some(
					(sel) => sel.tree instanceof PrimitiveTree
				)
			) {
				this.$refs.addKeyInput.blur()
				this.$refs.addValueInput.blur()
				this.$refs.editValueInput.focus()
			}
		},
	},
}
</script>

<style>
/* Base tree editor navigation styles */
.tree-editor-navigation {
	white-space: nowrap;
	overflow-x: auto;
	overflow-y: hidden;
	opacity: 0.4;
	transition: opacity 0.2s ease-in-out;
}
/* Increase opacity when hovering */
.tree-editor-navigation:hover {
	opacity: 0.9;
}
/* Hide scrollbar without active hover state */
.tree-editor-navigation::-webkit-scrollbar {
	height: 0px;
}
/* Show scrollbar when hovering */
.tree-editor-navigation:hover::-webkit-scrollbar {
	height: 5px;
}
.tree-editor-selection {
	border-radius: 4px;
	background: var(--v-lineHighlightBackground-base);
}
.editor-container {
	outline: none;
}

/* Smaller suggestions menu */
.json-editor-suggestions-menu .v-list-item,
.small-list .v-list-item {
	min-height: 28px !important;
}
.json-editor-suggestions-menu .v-list-item__content,
.small-list .v-list-item__content {
	padding: 4px 0 !important;
}
</style>

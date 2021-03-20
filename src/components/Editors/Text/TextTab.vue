<template>
	<div ref="monacoContainer" style="height: calc(100% - 48px); width: 100%" />
</template>

<script>
import * as monaco from 'monaco-editor'

export default {
	name: 'TextTab',
	props: {
		tab: Object,
		id: {
			type: Number,
			default: 0,
		},
	},
	computed: {
		tabSystem() {
			return this.tab.parent
		},
	},
	activated() {
		this.updateEditor()
	},
	mounted() {
		this.updateEditor()
	},
	methods: {
		updateEditor() {
			monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ESNext,
				allowNonTsExtensions: true,
				noLib: true,
				alwaysStrict: true,
			})

			this.tabSystem.createMonacoEditor(this.$refs.monacoContainer)
		},
	},
	watch: {
		fontSize(val) {
			this.monacoEditor.updateOptions({
				fontSize: this.fontSize,
			})
		},
		fontFamily(val) {
			this.monacoEditor.updateOptions({
				fontFamily: this.fontFamily,
			})
		},
	},
}
</script>

<style>
.monaco-action-bar {
	background: var(--v-menu-base) !important;
}
.action-item.focused > a {
	background: var(--v-primary-base) !important;
}
</style>

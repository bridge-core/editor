<template>
	<div @click="tab.parent.setActive(true)" ref="monacoContainer" />
</template>

<script>
export default {
	name: 'TextTab',
	props: {
		tab: Object,
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

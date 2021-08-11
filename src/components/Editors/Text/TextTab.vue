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
}
</script>

<style>
.monaco-action-bar {
	background: var(--v-menu-base) !important;
}
.action-item.focused > a {
	background: var(--v-primary-base) !important;
}
.actions-container {
	background: var(--v-background-base) !important;
}

.reference-file {
	margin-left: 8px;
	font-size: 14px;
}
.monaco-editor {
	user-select: auto;
}
.monaco-editor
	.peekview-widget
	.head
	.peekview-actions
	> .monaco-action-bar
	.action-item {
	margin: 0px 4px;
}
</style>

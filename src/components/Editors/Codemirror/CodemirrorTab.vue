<template>
	<div
		@click="tab.parent.setActive(true)"
		@contextmenu.stop
		ref="codemirrorContainer"
		class="overflow-auto"
	/>
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
	// activated() {
	// 	this.updateEditor()
	// },
	mounted() {
		this.updateEditor()
	},
	methods: {
		updateEditor() {
			this.tab.createCodemirrorEditor(this.$refs.codemirrorContainer)
		},
	},
}
</script>

<style>
.cm-focused {
	outline: none !important;
}
</style>

<template>
	<span
		:style="{
			color: def ? def.color : null,
			backgroundColor: def ? def.background : null,
			textDecoration,
		}"
		><slot
	/></span>
</template>

<script>
export default {
	props: {
		def: Object,
	},
	computed: {
		textDecoration() {
			if (!this.def) return null
			if (!this.def.textDecoration) this.def.textDecoration = ''

			if (this.def.isItalic) this.def.textDecoration += ' italic'
			return this.def.textDecoration
		},
	},
}
</script>

<style></style>

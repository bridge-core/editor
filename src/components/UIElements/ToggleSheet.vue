<template>
	<BridgeSheet
		:dark="dark"
		:class="{
			'content-area pa-2': true,
			selected: internalValue,
		}"
		@click.native="onClick"
	>
		<slot :value="internalValue" />
	</BridgeSheet>
</template>

<script>
import BridgeSheet from './Sheet.vue'

export default {
	name: 'ToogleSheet',
	components: {
		BridgeSheet,
	},
	props: {
		value: Boolean,
		dark: Boolean,
	},
	data() {
		return {
			internalValue: this.value,
		}
	},
	methods: {
		onClick() {
			this.internalValue = !this.internalValue
			this.$emit('input', this.internalValue)
		},
	},
}
</script>

<style scoped>
.content-area {
	border: solid 2px transparent;
}
.content-area.selected {
	border: 2px solid var(--v-primary-base);
}
</style>

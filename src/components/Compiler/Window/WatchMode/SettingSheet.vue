<template>
	<ToggleSheet :value="selected" @input="onInput">
		<slot name="header" />
		<SelectedStatus :selected="selected" />
		<slot />
	</ToggleSheet>
</template>

<script>
import SelectedStatus from '/@/components/UIElements/SelectedStatus.vue'
import ToggleSheet from '/@/components/UIElements/ToggleSheet.vue'

export default {
	components: { ToggleSheet, SelectedStatus },
	data: () => ({
		selected: false,
	}),
	methods: {
		onInput(val) {
			this.selected = val
			this.$emit('input', val)
		},
	},
}
</script>

<style></style>

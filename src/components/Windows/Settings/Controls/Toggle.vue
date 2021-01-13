<template>
	<div>
		<h3>{{ title }}</h3>
		<v-switch
			inset
			dense
			:label="description"
			:value="value"
			@change="onChange"
		/>
	</div>
</template>

<script>
export default {
	props: {
		title: String,
		value: String,
		description: String,
	},
	methods: {
		onChange(val) {
			this.$emit('change', val)
			this.$emit('onChange', val)
		},
	},
}
</script>

<style></style>

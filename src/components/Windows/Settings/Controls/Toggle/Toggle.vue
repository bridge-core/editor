<template>
	<div>
		<h3>{{ config.title }}</h3>
		<v-switch
			inset
			dense
			:label="config.description"
			:value="value_"
			@change="onChange"
		/>
	</div>
</template>

<script>
export default {
	props: {
		title: String,
		config: Object,
	},
	data: () => ({
		value_: undefined,
	}),
	mounted() {
		this.value_ = this.value
	},
	methods: {
		onChange(val) {
			this.$emit('change', val)
		},
	},
}
</script>

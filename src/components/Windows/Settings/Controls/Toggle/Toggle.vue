<template>
	<div>
		<h3>{{ config.title }}</h3>
		<v-switch
			style="margin-top: 0;"
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
		value: Boolean,
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
			this.$nextTick(() => this.$emit('change', val))
		},
	},
}
</script>

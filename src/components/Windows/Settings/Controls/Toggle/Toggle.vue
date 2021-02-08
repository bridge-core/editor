<template>
	<div>
		<h3>{{ config.name }}</h3>
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
		value: [Boolean, Promise],
		config: Object,
	},
	data: () => ({
		value_: undefined,
	}),
	async mounted() {
		this.value_ = await this.value
	},
	methods: {
		onChange(val) {
			this.$nextTick(() => this.$emit('change', val))
		},
	},
}
</script>

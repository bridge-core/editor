<template>
	<div>
		<h3>{{ config.title }}</h3>
		<v-btn-toggle
			inset
			dense
			:label="config.description"
			:value="value_"
			@change="onChange"
		>
			<v-btn v-for="option in config.options" :key="option">
				{{ option }}
			</v-btn>
		</v-btn-toggle>
	</div>
</template>

<script>
export default {
	props: {
		config: Object,
		value: String,
	},
	data: () => ({
		value_: undefined,
	}),
	mounted() {
		this.value_ = this.config.options.findIndex(val => val === this.value)
	},
	methods: {
		onChange(val) {
			this.$emit('change', this.config.options[val])
		},
	},
}
</script>

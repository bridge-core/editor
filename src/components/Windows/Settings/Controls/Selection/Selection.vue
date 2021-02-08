<template>
	<div>
		<h3>{{ config.name }}</h3>
		<div class="d-flex align-center">
			<div>
				<v-autocomplete
					inset
					dense
					mandatory
					outlined
					:value="value_"
					@change="onChange"
					:items="config.options"
					hide-details
				/>
			</div>

			<span class="ml-4 body-1">{{ config.description }}</span>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		config: Object,
		value: [String, Promise],
	},
	data: () => ({
		value_: undefined,
	}),
	async created() {
		this.value_ = (await this.value) || this.config.default
	},
	methods: {
		onChange(val) {
			console.log(val)
			this.$nextTick(() => this.$emit('change', val))
		},
	},
}
</script>

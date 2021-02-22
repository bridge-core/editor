<template>
	<div>
		<h3>{{ t(config.name) }}</h3>
		<v-switch
			style="margin-top: 0"
			inset
			dense
			:label="t(config.description)"
			:value="value_"
			@change="onChange"
		/>
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	props: {
		value: [Boolean, Promise],
		config: Object,
	},
	mixins: [TranslationMixin],
	data: () => ({
		value_: undefined,
	}),
	async mounted() {
		this.value_ = await this.value
	},
	methods: {
		onChange(val) {
			this.$emit('change', val === null ? false : val)
		},
	},
}
</script>

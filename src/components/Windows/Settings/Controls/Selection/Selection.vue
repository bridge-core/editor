<template>
	<div>
		<h3>{{ t(config.name) }}</h3>
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
					:menu-props="{ maxHeight: 220 }"
				/>
			</div>

			<span class="ml-4 text-normal">{{ t(config.description) }}</span>
		</div>
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	props: {
		config: Object,
		value: [String, Promise],
	},
	mixins: [TranslationMixin],
	data: () => ({
		value_: undefined,
	}),
	async created() {
		this.value_ = (await this.value) || this.config.default
	},
	methods: {
		onChange(val) {
			this.$nextTick(() => this.$emit('change', val))
		},
	},
}
</script>

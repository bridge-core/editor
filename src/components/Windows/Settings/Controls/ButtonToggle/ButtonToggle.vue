<template>
	<div>
		<h3>{{ t(config.name) }}</h3>
		<div class="d-flex">
			<div>
				<v-btn-toggle
					inset
					dense
					mandatory
					:label="config.description"
					:value="value_"
					@change="onChange"
				>
					<v-btn
						color="sidebarSelection"
						v-for="option in config.options"
						:key="option"
					>
						{{ option }}
					</v-btn>
				</v-btn-toggle>
			</div>

			<span class="ml-4 body-1">{{ t(config.description) }}</span>
		</div>
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	props: {
		config: Object,
		value: String,
	},
	mixins: [TranslationMixin],
	data: () => ({
		value_: undefined,
	}),
	created() {
		this.value_ =
			this.config.options.findIndex(val => val === this.value) || 0
	},
	methods: {
		onChange(val) {
			this.$nextTick(() => this.$emit('change', this.config.options[val]))
		},
	},
}
</script>

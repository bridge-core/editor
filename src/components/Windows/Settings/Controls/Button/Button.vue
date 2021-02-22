<template>
	<div class="d-flex align-center">
		<v-btn color="primary" @click="config.onClick">
			{{ t(config.name) }}
		</v-btn>

		<span class="ml-4 body-1">{{ t(config.description) }}</span>
	</div>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'

export default {
	props: {
		config: Object,
	},
	mixins: [TranslationMixin],
}
</script>

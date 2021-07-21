<template>
	<v-card color="transparent" elevation="0" rounded="lg">
		<v-card-text class="d-flex align-center">
			<v-icon color="primary" class="pr-2" x-large>
				mdi-plus-circle-outline
			</v-icon>
			<span class="text-h5">{{
				t('initialSetup.step.comMojang.extraDescription')
			}}</span>
		</v-card-text>
		<v-card-actions>
			<v-spacer />
			<v-btn @click="$emit('next')">{{ t('general.skip') }}</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script>
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	mixins: [TranslationMixin],
	mounted() {
		App.instance.comMojang.setup.fired.then(() => {
			this.$emit('next')
		})
	},
}
</script>

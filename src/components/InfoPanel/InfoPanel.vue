<template>
	<v-alert
		:type="infoPanel.type"
		rounded="lg"
		:dismissible="infoPanel.isDismissible"
	>
		{{ t(infoPanel.text) }}
	</v-alert>
</template>

<script>
import { TranslationMixin } from '../Mixins/TranslationMixin'
import { InfoPanel } from './InfoPanel'

export default {
	mixins: [TranslationMixin],
	props: {
		infoPanel: InfoPanel,
	},
}
</script>

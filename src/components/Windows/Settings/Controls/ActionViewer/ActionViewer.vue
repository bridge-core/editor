<template>
	<ActionViewer :action="config.action" />
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import ActionViewer from '/@/components/Actions/ActionViewer.vue'

export default {
	props: {
		config: Object,
	},
	components: {
		ActionViewer,
	},
	mixins: [TranslationMixin],
}
</script>

<template>
	<v-btn @click="createProject" :color="color" class="mb-2" block>
		<v-icon>mdi-plus</v-icon>
		{{ t('windows.packExplorer.noProjectView.createLocalProject') }}
	</v-btn>
</template>

<script>
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	mixins: [TranslationMixin],
	props: {
		color: {
			default: 'background',
			type: String,
		},
	},
	methods: {
		async createProject() {
			const app = await App.getApp()

			app.windows.createProject.open()
		},
	},
}
</script>

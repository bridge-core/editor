<template>
	<v-overlay :opacity="0.9" v-model="state.isHovering">
		<div class="d-flex flex-column align-center justify-center">
			<v-icon style="font-size: 8em" color="primary">
				mdi-plus-circle-outline
			</v-icon>
			<h1>{{ t('fileDropper.importFiles') }}</h1>
		</div>
	</v-overlay>
</template>

<script>
import { TranslationMixin } from '../Mixins/TranslationMixin'
import { App } from '/@/App.ts'

export default {
	name: 'FileDropperUI',
	mixins: [TranslationMixin],

	data: () => ({
		state: { isHovering: false },
	}),
	mounted() {
		App.getApp().then((app) => {
			this.state = app.fileDropper.state
		})
	},
}
</script>

<style></style>

<template>
	<v-overlay :opacity="0.9" v-model="state.isHovering">
		<div class="d-flex flex-column align-center justify-center">
			<template v-if="failedImports.length === 0">
				<v-icon style="font-size: 8em" color="primary">
					mdi-plus-circle-outline
				</v-icon>
				<h1>{{ t('fileDropper.importFiles') }}</h1>
			</template>

			<template v-else>
				<v-icon style="font-size: 8em" color="error">
					mdi-alert-circle-outline
				</v-icon>
				<h1>{{ t('fileDropper.importFailed') }}</h1>
				<ul>
					<li v-for="(failedImport, i) in failedImports" :key="i">
						{{ failedImport }}
					</li>
				</ul>
			</template>
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
		state: { isHovering: false, failedImports: [] },
	}),
	mounted() {
		App.getApp().then((app) => {
			this.state = app.fileDropper.state
		})
	},
	computed: {
		failedImports() {
			return this.state.failedImports.length < 3
				? this.state.failedImports
				: [
						...this.state.failedImports.slice(0, 3),
						this.t('fileDropper.andMore'),
				  ]
		},
	},
}
</script>

<style></style>

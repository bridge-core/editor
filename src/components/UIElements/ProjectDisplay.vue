<template>
	<div class="d-flex align-center pa-2 clickable" @click="onClick" v-ripple>
		<img
			:src="imgSrc"
			style="image-rendering: pixelated"
			class="rounded-lg"
			draggable="false"
			height="44px"
			:alt="`Pack Icon of ${name}`"
		/>

		<h1
			class="project-display-header ml-2"
			style="
				opacity: 0.7;
				display: block;
				width: calc(100% - 52px);
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			"
		>
			{{ name }}
		</h1>
	</div>
</template>

<script>
import { App } from '/@/App'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { createVirtualProjectWindow } from '/@/components/FileSystem/Virtual/ProjectWindow'
const defaultImgSrc = '/img/icons/android-chrome-192x192.png'

export default {
	props: {
		imgSrc: {
			type: String,
			default: defaultImgSrc,
		},
		name: {
			type: String,
			default: 'Unknown',
		},
	},
	methods: {
		async onClick() {
			const app = await App.getApp()

			if (isUsingFileSystemPolyfill.value) {
				createVirtualProjectWindow()
			} else {
				app.windows.projectChooser.open()
			}
		},
	},
}
</script>

<style scoped>
.project-display-header {
	font-size: 2.125rem !important;
	font-weight: 400;
	line-height: 2.5rem;
	letter-spacing: 0.0073529412em !important;
}
</style>

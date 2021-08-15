<template>
	<div class="d-flex align-center pa-2 clickable" @click="onClick" v-ripple>
		<img
			:src="imgSrc"
			class="rounded-lg"
			draggable="false"
			height="44px"
			alt=""
		/>
		<h1
			class="text-h4 ml-2"
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

const defaultImgSrc = '/img/icons/android-chrome-192x192.png'

export default {
	data: () => ({
		imgSrc: defaultImgSrc,
		name: 'Unknown',
	}),
	mounted() {
		this.onProjectChanged()
		App.eventSystem.on('projectChanged', this.onProjectChanged)
	},
	destroyed() {
		App.eventSystem.off('projectChanged', this.onProjectChanged)
	},
	methods: {
		onClick() {
			App.getApp().then((app) => app.windows.projectChooser.open())
		},
		async onProjectChanged() {
			const app = await App.getApp()
			await app.projectManager.projectReady.fired
			const projectData = app.project.projectData

			this.name = projectData.name ?? 'Unknown'
			this.imgSrc = projectData.imgSrc ?? defaultImgSrc
		},
	},
}
</script>

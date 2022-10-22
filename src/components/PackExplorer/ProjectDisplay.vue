<template>
	<ProjectDisplay :imgSrc="imgSrc" :name="name" />
</template>

<script>
import ProjectDisplay from '/@/components/UIElements/ProjectDisplay.vue'
import { App } from '/@/App'

export default {
	components: {
		ProjectDisplay,
	},
	data: () => ({
		imgSrc: undefined,
		name: undefined,
	}),
	mounted() {
		this.onProjectChanged()
		App.eventSystem.on('projectChanged', this.onProjectChanged)
	},
	destroyed() {
		App.eventSystem.off('projectChanged', this.onProjectChanged)
	},
	methods: {
		async onProjectChanged() {
			const app = await App.getApp()
			await app.projectManager.projectReady.fired
			const project = app.project
			const projectData = project.projectData

			this.name = project.displayName
			this.imgSrc = projectData.imgSrc
		},
	},
}
</script>

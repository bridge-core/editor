<template>
	<ProjectDisplay :imgSrc="imgSrc" :name="name" />
</template>

<script>
import ProjectDisplay from '/@/components/UIElements/ProjectDisplay.vue'
import { App } from '/@/App'

export default {
	components: { ProjectDisplay },
	data: () => ({
		imgSrc: undefined,
		name: undefined,
	}),
	async mounted() {
		const app = await App.getApp()

		const { projectIcon, projectName } = app.viewComMojangProject
		this.name = projectName
		this.imgSrc = projectIcon
	},
}
</script>

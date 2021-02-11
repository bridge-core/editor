// @ts-nocheck
import { App } from '@/App'

export const ProjectMixin = {
	data: () => ({ isProjectMixinReady: false }),
	async mounted() {
		const app = await App.getApp()
		await app.projectManager.fired
		this.isProjectMixinReady = true
	},
	computed: {
		project() {
			if (!this.isProjectMixinReady) return
			const projectManager = App.instance.projectManager

			return projectManager.state[projectManager._selectedProject]
		},
	},
}

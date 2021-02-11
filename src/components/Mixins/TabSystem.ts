// @ts-nocheck
import { App } from '@/App'

export const TabSystemMixin = {
	data: () => ({ app: null }),
	async mounted() {
		const app = await App.getApp()
		await app.projectManager.fired
		this.app = app
	},
	computed: {
		project() {},
		tabSystem() {
			if (!this.app) return
			const projectManager = this.app.projectManager

			return projectManager.state[projectManager._selectedProject]
				.tabSystem
		},
	},
}

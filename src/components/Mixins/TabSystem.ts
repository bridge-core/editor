// @ts-nocheck
import { ProjectMixin } from './Project'

export const TabSystemMixin = {
	mixins: [ProjectMixin],
	computed: {
		tabSystem() {
			if (this.project) return this.project.tabSystem
		},
		tabSystems() {
			if (this.project) return this.project.tabSystems
		},
		shouldRenderWelcomeScreen() {
			return (
				this.tabSystems &&
				(this.tabSystems[0].shouldRender ||
					this.tabSystems[1].shouldRender)
			)
		},
	},
}

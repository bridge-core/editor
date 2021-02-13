// @ts-nocheck
import { ProjectMixin } from './Project'

export const TabSystemMixin = {
	mixins: [ProjectMixin],
	computed: {
		tabSystem() {
			if (this.project) return this.project.tabSystem
		},
	},
}

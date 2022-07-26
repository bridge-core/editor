import { Project } from '/@/components/Projects/Project/Project'

export const ToLocalProjectAction = (project: Project) => ({
	name: 'packExplorer.move.toLocal',
	icon: 'mdi-lock-open-outline',
	onTrigger: async () => {
		project.switchProjectType()
	},
})

import { Project } from '/@/components/Projects/Project/Project'

export const ToBridgeFolderProjectAction = (project: Project) => ({
	name: 'packExplorer.move.toBridgeFolder',
	icon: 'mdi-folder-sync-outline',
	onTrigger: async () => {
		let didSetupBridgeFolder = project.app.bridgeFolderSetup.hasFired
		if (!didSetupBridgeFolder)
			didSetupBridgeFolder = await project.app.setupBridgeFolder()

		if (didSetupBridgeFolder) project.switchProjectType()
	},
})

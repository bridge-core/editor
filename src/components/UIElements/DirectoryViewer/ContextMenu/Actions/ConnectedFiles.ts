import { FileWrapper } from '../../FileView/FileWrapper'
import { ViewCompilerOutput } from './ViewCompilerOutput'
import { App } from '/@/App'
import { ISubmenuConfig } from '/@/components/ContextMenu/showContextMenu'
import { basename } from '/@/utils/path'

export const ViewConnectedFiles = async (fileWrapper: FileWrapper) => {
	if (!fileWrapper.path) return null
	const app = await App.getApp()

	const connectedFiles = await app.project.packIndexer.service.getConnectedFiles(
		fileWrapper.path
	)
	const connectedFilesActions = connectedFiles.map((filePath) => {
		const fileType = App.fileType.get(filePath)
		const packType = App.packType.get(filePath)
		console.log(packType)

		return {
			icon: fileType?.icon ?? 'mdi-file-outline',
			color: packType?.color,
			name: `[${basename(filePath)}]`,
			description: fileType ? `fileType.${fileType.id}` : undefined,
			onTrigger: async () => {
				await app.project.openFile(
					await app.fileSystem.getFileHandle(filePath)
				)
			},
		}
	})

	return <ISubmenuConfig>{
		type: 'submenu',
		icon: 'mdi-spider-web',
		name: 'actions.viewConnectedFiles.name',
		description: 'actions.viewConnectedFiles.description',

		actions: [
			ViewCompilerOutput(fileWrapper.path),
			{ type: 'divider' },
			...connectedFilesActions,
		],
	}
}

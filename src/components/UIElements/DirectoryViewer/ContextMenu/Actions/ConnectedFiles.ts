import { FileWrapper } from '../../FileView/FileWrapper'
import { ViewCompilerOutput } from './ViewCompilerOutput'
import { App } from '/@/App'
import { ISubmenuConfig } from '/@/components/ContextMenu/showContextMenu'
import { basename } from '/@/utils/path'

export const ViewConnectedFiles = async (fileWrapper: FileWrapper) => {
	if (!fileWrapper.path) return null
	const app = await App.getApp()
	const packIndexer = app.project.packIndexer

	const connectedFiles = createSimpleActions(
		packIndexer.hasFired
			? await packIndexer.service.getConnectedFiles(fileWrapper.path)
			: []
	)

	const compilerFiles = app.project.compilerReady.hasFired
		? await app.project.compilerService.getFileDependencies(
				fileWrapper.path
		  )
		: []
	const compilerFileActions = [
		ViewCompilerOutput(fileWrapper.path, false, false),
	].concat(createSimpleActions(compilerFiles))

	return connectedFiles.length === 0 && compilerFileActions.length === 1
		? ViewCompilerOutput(fileWrapper.path)
		: <ISubmenuConfig>{
				type: 'submenu',
				icon: 'mdi-spider-web',
				name: 'actions.viewConnectedFiles.name',
				description: 'actions.viewConnectedFiles.description',

				actions: [
					...compilerFileActions,
					connectedFiles.length > 0 ? { type: 'divider' } : null,
					...connectedFiles,
				],
		  }
}

function createSimpleActions(filePaths: string[]) {
	return filePaths.map((filePath) => {
		const fileType = App.fileType.get(filePath)
		const packType = App.packType.get(filePath)

		return {
			icon: fileType?.icon ?? 'mdi-file-outline',
			color: packType?.color,
			name: `[${basename(filePath)}]`,
			description: fileType ? `fileType.${fileType.id}` : undefined,
			onTrigger: async () => {
				const app = await App.getApp()

				await app.project.openFile(
					await app.fileSystem.getFileHandle(filePath)
				)
			},
		}
	})
}

import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { App } from '/@/App'
import { InformedChoiceWindow } from '../Windows/InformedChoice/InformedChoice'
import { FilePathWindow } from '../Windows/Common/FilePath/Window'

export class TextFileImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(
			['.mcfunction', '.json', '.molang', '.js', '.ts', '.lang'],
			fileDropper
		)
	}

	async onImport(fileHandle: FileSystemFileHandle) {
		const app = await App.getApp()
		const t = app.locales.translate.bind(app.locales)

		const saveOrOpenWindow = new InformedChoiceWindow(
			'fileDropper.importMethod',
			{
				isPersistent: true,
			}
		)
		const actionManager = await saveOrOpenWindow.actionManager
		actionManager.create({
			icon: 'mdi-content-save-outline',
			name: 'fileDropper.saveToProject.title',
			description: `[${t('fileDropper.saveToProject.description1')} "${
				fileHandle.name
			}" ${t('fileDropper.saveToProject.description2')}]`,
			onTrigger: () => this.onSave(fileHandle),
		})
		actionManager.create({
			icon: 'mdi-share-outline',
			name: 'fileDropper.openFile.title',
			description: `[${t('fileDropper.openFile.description1')} "${
				fileHandle.name
			}" ${t('fileDropper.openFile.description2')}]`,
			onTrigger: () => this.onOpen(fileHandle),
		})

		saveOrOpenWindow.open()
		await saveOrOpenWindow.fired
	}

	protected async onSave(fileHandle: FileSystemFileHandle) {
		const app = await App.getApp()
		const filePathWindow = new FilePathWindow()
		filePathWindow.open()

		const filePath = await filePathWindow.fired

		const destHandle = await app.project.fileSystem.getFileHandle(
			`${filePath}${fileHandle.name}`,
			true
		)

		await app.project.fileSystem.copyFileHandle(fileHandle, destHandle)
		await app.project.updateFile(`${filePath}${fileHandle.name}`)
		await app.project.openFile(destHandle)
	}
	protected async onOpen(fileHandle: FileSystemFileHandle) {
		const app = await App.getApp()

		await app.project.openFile(fileHandle)
	}
}

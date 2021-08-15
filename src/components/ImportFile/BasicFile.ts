import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { App } from '/@/App'
import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { FilePathWindow } from '/@/components/Windows/Common/FilePath/Window'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { AnyFileHandle } from '../FileSystem/Types'

export class BasicFileImporter extends FileImporter {
	constructor(fileDropper: FileDropper) {
		super(
			[
				'.mcfunction',
				'.mcstructure',
				'.json',
				'.molang',
				'.js',
				'.ts',
				'.lang',
				'.tga',
				'.png',
				'.jpg',
				'.jpeg',
			],
			fileDropper
		)
	}

	async onImport(fileHandle: AnyFileHandle) {
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

	protected async onSave(fileHandle: AnyFileHandle) {
		const app = await App.getApp()
		const filePathWindow = new FilePathWindow('', false)
		filePathWindow.open()

		const filePath = await filePathWindow.fired
		if (filePath === null) return

		// Get user confirmation if file overwrites already existing file
		const fileExists = await app.project.fileSystem.fileExists(
			`${filePath}${fileHandle.name}`
		)
		if (fileExists) {
			const confirmWindow = new ConfirmationWindow({
				description: 'windows.createPreset.overwriteFiles',
				confirmText: 'windows.createPreset.overwriteFilesConfirm',
			})

			confirmWindow.open()
			if (!(await confirmWindow.fired)) return
		}

		app.windows.loadingWindow.open()

		const destHandle = await app.project.fileSystem.getFileHandle(
			`${filePath}${fileHandle.name}`,
			true
		)

		await app.project.fileSystem.copyFileHandle(fileHandle, destHandle)
		App.eventSystem.dispatch('fileAdded', undefined)

		await app.project.updateFile(`${filePath}${fileHandle.name}`)
		await app.project.openFile(destHandle, { isTemporary: false })

		app.windows.loadingWindow.close()
	}
	protected async onOpen(fileHandle: AnyFileHandle) {
		const app = await App.getApp()

		await app.project.openFile(fileHandle)
	}
}

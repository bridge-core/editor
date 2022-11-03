import { FileDropper } from '/@/components/FileDropper/FileDropper'
import { FileImporter } from './Importer'
import { App } from '/@/App'
import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { FilePathWindow } from '/@/components/Windows/Common/FilePath/Window'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { AnyFileHandle } from '../FileSystem/Types'
import { join } from '/@/utils/path'
import { translate } from '../Locales/Manager'

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
				'.wav',
				'.ogg',
				'.mp3',
				'.fsb',
			],
			fileDropper,
			true
		)
	}

	async onImport(fileHandle: AnyFileHandle) {
		const app = await App.getApp()
		const t = translate

		// If current project is virtual project, simply open the file
		await app.projectManager.projectReady.fired
		if (app.project.isVirtualProject) {
			return await this.onOpen(fileHandle)
		}

		const saveOrOpenWindow = new InformedChoiceWindow(
			'fileDropper.importMethod.name',
			{
				isPersistent: false,
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

		const guessedFolder = await App.fileType.guessFolder(fileHandle)

		// Allow user to change file path that the file is saved to
		const filePathWindow = new FilePathWindow({
			fileName: fileHandle.name,
			startPath: guessedFolder
				? app.project.relativePath(guessedFolder)
				: '',
			isPersistent: false,
		})
		filePathWindow.open()

		const userInput = await filePathWindow.fired
		if (userInput === null) return
		const { filePath, fileName = fileHandle.name } = userInput
		const newFilePath = join(filePath, fileName)

		// Get user confirmation if file overwrites already existing file
		const fileExists = await app.project.fileSystem.fileExists(newFilePath)
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
			newFilePath,
			true
		)

		await app.project.fileSystem.copyFileHandle(fileHandle, destHandle)
		App.eventSystem.dispatch('fileAdded', undefined)

		await app.project.updateFile(
			app.project.config.resolvePackPath(undefined, newFilePath)
		)
		await app.project.openFile(destHandle, { isTemporary: false })

		app.windows.loadingWindow.close()
	}
	protected async onOpen(fileHandle: AnyFileHandle) {
		const app = await App.getApp()

		await app.project.openFile(fileHandle)
	}
}

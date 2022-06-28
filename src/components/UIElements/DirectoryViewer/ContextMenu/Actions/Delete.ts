import { App } from '/@/App'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'

export const DeleteAction = (baseWrapper: BaseWrapper<any>) => ({
	icon: 'mdi-delete-outline',
	name: 'windows.packExplorer.fileActions.delete.name',
	description: 'windows.packExplorer.fileActions.delete.description',
	onTrigger: async () => {
		const app = await App.getApp()
		const t = (str: string) => app.locales.translate(str)

		const confirmWindow = new ConfirmationWindow({
			description: `[${t(
				'windows.packExplorer.fileActions.delete.confirmText'
			)} "${baseWrapper.path ?? baseWrapper.name}"? ${t(
				'windows.packExplorer.fileActions.delete.noRestoring'
			)}]`,
		})

		if (!(await confirmWindow.fired)) return

		await app.project.unlinkHandle(baseWrapper.handle)
		await baseWrapper.getParent()?.refresh()
	},
})

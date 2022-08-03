import { App } from '/@/App'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import { ConfirmationWindow } from '/@/components/Windows/Common/Confirm/ConfirmWindow'
import { translate } from '/@/components/Locales/Manager'

export const DeleteAction = (baseWrapper: BaseWrapper<any>) => ({
	icon: 'mdi-delete-outline',
	name: 'actions.delete.name',

	onTrigger: async () => {
		const parent = baseWrapper.getParent()
		if (baseWrapper.options.isReadOnly || parent === null) return

		const app = await App.getApp()
		const t = (str: string) => translate(str)

		const confirmWindow = new ConfirmationWindow({
			description: `[${t('actions.delete.confirmText')} "${
				baseWrapper.path ?? baseWrapper.name
			}"? ${t('actions.delete.noRestoring')}]`,
		})

		if (!(await confirmWindow.fired)) return

		const success = await app.project.unlinkHandle(baseWrapper.handle)

		// File is not part of the bridge. folder, we need to unlink it manually
		if (!success) {
			await parent.handle.removeEntry(baseWrapper.name, {
				recursive: true,
			})
		}
		await baseWrapper.getParent()?.refresh()
	},
})

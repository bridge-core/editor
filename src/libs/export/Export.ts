import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { AlertWindow } from '@/components/Windows/Alert/AlertWindow'
import { Windows } from '@/components/Windows/Windows'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { LocaleManager } from '../locales/Locales'

export async function saveOrDownload(path: string, data: Uint8Array, fileSystem: BaseFileSystem) {
	await fileSystem.writeFile(path, data)

	NotificationSystem.addNotification(
		'download',
		async () => {
			Windows.open(
				new AlertWindow(`[${LocaleManager.translate('general.successfulExport.description')}: "${path}"]`)
			)
		},
		'success'
	)
}

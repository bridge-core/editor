import { FileType } from '../Data/FileType'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { App } from '/@/App'

export async function viewDocumentation(filePath: string, word: string) {
	await FileType.ready.fired
	const app = await App.getApp()
	const t = (str: string) => app.locales.translate(str)

	const { id, documentation } = FileType.get(filePath) ?? {}

	if (!documentation) {
		new InformationWindow({
			description: `[${t(
				'actions.documentationLookup.noDocumentation'
			)} ${id ? t(`fileType.${id}`) : '"' + filePath + '"'}.]`,
		})
		return
	}

	let url = documentation.baseUrl
	if (documentation.supportsQuerying) url += `#${word}`

	App.openUrl(url)
}

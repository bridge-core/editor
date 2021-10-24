import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { App } from '/@/App'

export async function viewDocumentation(filePath: string, word?: string) {
	await App.fileType.ready.fired
	const app = await App.getApp()
	const t = (str: string) => app.locales.translate(str)

	const { id, documentation } = App.fileType.get(filePath) ?? {}

	if (!documentation) {
		new InformationWindow({
			description: `[${t(
				'actions.documentationLookup.noDocumentation'
			)} ${id ? t(`fileType.${id}`) : '"' + filePath + '"'}.]`,
		})
		return
	}

	let url = documentation.baseUrl
	if (word && (documentation.supportsQuerying ?? true)) url += `#${word}`

	App.openUrl(url)
}

import { openUrl } from './OpenUrl'

export async function viewDocumentation(fileType: any, word: string) {
	let url = fileType.documentation.baseUrl
	if (word && (fileType.documentation.supportsQuerying ?? true)) url += `#${word}`

	openUrl(url)
}

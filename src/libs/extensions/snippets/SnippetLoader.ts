import { Extensions } from '@/libs/extensions/Extensions'
import { Snippet } from './Snippet'

export class SnippetLoader {
	public getSnippets(formatVersion: string, fileType: string, locations: string[]): Snippet[] {
		console.log(
			[...Extensions.globalExtensions, ...Extensions.projectExtensions].flatMap((extension) => extension.snippets)
		)

		return [...Extensions.globalExtensions, ...Extensions.projectExtensions]
			.flatMap((extension) => extension.snippets)
			.filter((snippet) => snippet.isValid(formatVersion, fileType, locations))
	}
}

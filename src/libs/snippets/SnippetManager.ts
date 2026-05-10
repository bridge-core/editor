import { Extensions } from '@/libs/extensions/Extensions'
import { Snippet } from './Snippet'

export class SnippetManager {
	public getSnippets(formatVersion: string, fileType: string, locations: string[]): Snippet[] {
		return Extensions.snippets.filter((snippet) => snippet.isValid(formatVersion, fileType, locations))
	}
}

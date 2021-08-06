import json5 from 'json5'
import { Snippet } from './Snippet'
import { App } from '/@/App'
import { iterateDir } from '/@/utils/iterateDir'
import './Monaco'

export class SnippetLoader {
	protected snippets = new Set<Snippet>()

	async activate() {
		const app = await App.getApp()
		const packageHandle = await app.project.getCurrentDataPackage()
		const snippetHandle = await packageHandle.getDirectoryHandle(
			'snippet',
			{ create: true }
		)

		await iterateDir(snippetHandle, async (fileHandle) => {
			this.addSnippet(
				new Snippet(
					json5.parse(
						await fileHandle.getFile().then((file) => file.text())
					)
				)
			)
		})
	}

	async deactivate() {
		this.snippets.clear()
	}

	async addSnippet(snippet: Snippet) {
		this.snippets.add(snippet)

		return {
			dispose: () => {
				this.snippets.delete(snippet)
			},
		}
	}

	getSnippetsFor(fileType: string, locations: string[]) {
		return [...this.snippets].filter((snippet) =>
			snippet.isValid(fileType, locations)
		)
	}
}

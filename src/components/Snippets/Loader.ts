import json5 from 'json5'
import { Snippet } from './Snippet'
import { App } from '/@/App'
import { iterateDir } from '/@/libs/iterateDir'
import './Monaco'
import { AnyDirectoryHandle } from '../FileSystem/Types'
import { IDisposable } from '/@/types/disposable'
import type { Project } from '../Projects/Project/Project'

export class SnippetLoader {
	protected snippets = new Set<Snippet>()

	constructor(protected project: Project) {}

	async activate() {
		const app = await App.getApp()
		const packageHandle = await app.project.getCurrentDataPackage()
		const snippetHandle = await packageHandle
			.getDirectoryHandle('snippet')
			.catch(() => null)

		if (!snippetHandle) return

		await this.loadFrom(snippetHandle)
	}

	async loadFrom(directory: AnyDirectoryHandle) {
		const disposables: IDisposable[] = []

		await iterateDir(directory, async (fileHandle, filePath) => {
			let snippetJson: any
			try {
				snippetJson = json5.parse(
					await fileHandle.getFile().then((file) => file.text())
				)
			} catch (e) {
				console.error(`Invalid JSON within snippet "${filePath}"`)
				return
			}

			disposables.push(this.addSnippet(new Snippet(snippetJson)))
		})

		return disposables
	}

	async deactivate() {
		this.snippets.clear()
	}

	addSnippet(snippet: Snippet) {
		this.snippets.add(snippet)

		return {
			dispose: () => {
				this.snippets.delete(snippet)
			},
		}
	}

	getSnippetsFor(
		formatVersion: string,
		fileType: string,
		locations: string[]
	) {
		return [...this.snippets].filter((snippet) =>
			snippet.isValid(formatVersion, fileType, locations)
		)
	}
}

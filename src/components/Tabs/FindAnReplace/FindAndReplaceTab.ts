import { Tab } from '@/components/TabSystem/Tab'
import { Component, Ref, ref } from 'vue'
import FindAndReplaceTabComponent from './FindAndReplaceTab.vue'
import { v4 as uuid } from 'uuid'
import { fileSystem } from '@/App'
import { ProjectManager } from '@/libs/project/ProjectManager'
import escapeRegExpString from 'escape-string-regexp'

interface QueryResult {
	value: string
	previousContext: string | null
	nextContext: string | null
}

export class FindAndReplaceTab extends Tab {
	public name = ref('Find and Replace')
	public component: Component | null = FindAndReplaceTabComponent
	public queryResult: Ref<QueryResult[]> = ref([])
	public currentQueryId: string | null = null

	public async startSearch(query: string, matchCase: boolean, useRegex: boolean) {
		if (ProjectManager.currentProject === null) return

		const searchId = uuid()
		const regex = this.createRegExp(query, matchCase, useRegex)

		this.queryResult.value = []
		this.queryResult.value = [...this.queryResult.value]

		this.currentQueryId = searchId

		if (regex === undefined) return

		if (query.length === 0) return

		this.searchDirectory(ProjectManager.currentProject.path, regex, searchId)
	}

	private async searchDirectory(path: string, regex: RegExp, searchId: string) {
		for (const entry of await fileSystem.readDirectoryEntries(path)) {
			if (entry.type === 'directory') await this.searchDirectory(entry.path, regex, searchId)

			if (entry.type === 'file' && (entry.path.endsWith('.txt') || entry.path.endsWith('.json'))) {
				const content = await fileSystem.readFileText(entry.path)

				if (this.currentQueryId !== searchId) return

				let match = regex.exec(content)

				while (match !== null) {
					if (!match.index) continue

					const value = match[0]

					let previousContext =
						match.index !== 0 ? content.slice(Math.max(0, match.index - 50), match.index) : null

					let nextContext =
						match.index !== content.length - 1
							? content.slice(
									match.index + value.length,
									Math.min(content.length, match.index + value.length + 50)
							  )
							: null

					this.queryResult.value.push({
						value,
						previousContext,
						nextContext,
					})

					console.log(match)

					match = regex.exec(content)
				}
			}
		}

		this.queryResult.value = [...this.queryResult.value]
	}

	private createRegExp(searchFor: string, matchCase: boolean, useRegex: boolean) {
		let regExp: RegExp

		try {
			regExp = new RegExp(useRegex ? searchFor : escapeRegExpString(searchFor), `g${matchCase ? '' : 'i'}`)
		} catch {
			return
		}

		return regExp
	}
}

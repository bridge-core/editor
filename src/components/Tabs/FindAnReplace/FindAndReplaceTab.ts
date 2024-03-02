import { Tab } from '@/components/TabSystem/Tab'
import { Component, Ref, ref } from 'vue'
import FindAndReplaceTabComponent from './FindAndReplaceTab.vue'
import { v4 as uuid } from 'uuid'
import { fileSystem } from '@/App'
import { ProjectManager } from '@/libs/project/ProjectManager'
import escapeRegExpString from 'escape-string-regexp'

export class FindAndReplaceTab extends Tab {
	public name = ref('Find and Replace')
	public component: Component | null = FindAndReplaceTabComponent
	public queryResult: Ref<string[]> = ref([])

	public async startSearch(query: string, matchCase: boolean, useRegex: boolean) {
		if (ProjectManager.currentProject === null) return

		const searchId = uuid()
		const regex = this.createRegExp(query, matchCase, useRegex)

		this.queryResult.value = []

		if (regex === undefined) return

		this.searchDirectory(ProjectManager.currentProject.path, regex, searchId)
	}

	private async searchDirectory(path: string, regex: RegExp, searchId: string) {
		for (const entry of await fileSystem.readDirectoryEntries(path)) {
			if (entry.type === 'directory') await this.searchDirectory(entry.path, regex, searchId)

			if (entry.type === 'file' && (entry.path.endsWith('.txt') || entry.path.endsWith('.json'))) {
				const content = await fileSystem.readFileText(entry.path)

				const matches = content.matchAll(regex)

				for (const match of matches) {
					this.queryResult.value.push(
						content.slice(
							Math.max(0, (match.index ?? 0) - 50),
							Math.min(content.length, (match.index ?? 0) + 50)
						)
					)

					console.log(match)
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

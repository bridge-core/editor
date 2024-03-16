import { Tab } from '@/components/TabSystem/Tab'
import { Component, Ref, ref } from 'vue'
import FindAndReplaceTabComponent from './FindAndReplaceTab.vue'
import { v4 as uuid } from 'uuid'
import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { ProjectManager } from '@/libs/project/ProjectManager'
import escapeRegExpString from 'escape-string-regexp'
import { BedrockProject } from '@/libs/project/BedrockProject'

interface QueryResult {
	value: string
	previousContext: string | null
	nextContext: string | null
}

export class FindAndReplaceTab extends Tab {
	public name = ref('Find and Replace')
	public component: Component | null = FindAndReplaceTabComponent
	public queryResult: Ref<
		Record<
			string,
			{
				prettyPath: string
				icon: string
				color: string
				results: QueryResult[]
			}
		>
	> = ref({})

	private currentQueryId: string | null = null
	private currentSearch: Promise<void> | null = null
	private currentRegex: RegExp | null = null

	public async startSearch(query: string, matchCase: boolean, useRegex: boolean) {
		if (ProjectManager.currentProject === null) return

		const searchId = uuid()
		const regex = this.createRegExp(query, matchCase, useRegex)

		this.queryResult.value = {}

		this.currentQueryId = searchId

		if (regex === undefined) return

		if (query.length === 0) return

		this.currentRegex = regex
		this.currentSearch = this.searchDirectory(ProjectManager.currentProject.path, regex, searchId)
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

					if (ProjectManager.currentProject === null) return

					let prettyPath = entry.path.substring(ProjectManager.currentProject.path.length + 1)

					if (!this.queryResult.value[entry.path]) {
						let icon = 'data_object'
						let color = 'text'

						if (ProjectManager.currentProject instanceof BedrockProject) {
							const [packId, _] = Object.entries(ProjectManager.currentProject.packs).find(([id, path]) =>
								entry.path.startsWith(path)
							) ?? [null, null]

							if (packId) {
								const definition = ProjectManager.currentProject.packDefinitions.find(
									(definition) => definition.id === packId
								)

								if (definition) color = definition.color
							}

							const fileType = await ProjectManager.currentProject.fileTypeData.get(entry.path)

							if (fileType && fileType.icon) icon = fileType.icon
						}

						this.queryResult.value[entry.path] = {
							prettyPath: prettyPath,
							icon,
							color,
							results: [],
						}
					}

					this.queryResult.value[entry.path].results.push({
						value,
						previousContext,
						nextContext,
					})

					match = regex.exec(content)
				}
			}
		}

		this.queryResult.value = { ...this.queryResult.value }
	}

	public async replace(value: string) {
		await this.currentSearch

		if (!this.currentRegex) return

		for (const path of Object.keys(this.queryResult.value)) {
			const content = await fileSystem.readFileText(path)

			await fileSystem.writeFile(path, content.replaceAll(this.currentRegex, value))

			for (const result of this.queryResult.value[path].results) {
				result.value = value
			}

			this.queryResult.value = { ...this.queryResult.value }
		}
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

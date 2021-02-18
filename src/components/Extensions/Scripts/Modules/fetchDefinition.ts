import { App } from '@/App'
import { IModuleConfig } from '../types'

export const FetchDefinitionModule = ({}: IModuleConfig) => ({
	fetchDefinition: async (
		fileType: string,
		fetchDefs: string[],
		fetchSearch: string,
		fetchAll = false
	) => {
		const app = await App.getApp()
		const packIndexer = app.project?.packIndexer
		if (!packIndexer) return []

		const files = await Promise.all(
			fetchDefs.map(
				fetchDef =>
					packIndexer.service?.find(
						fileType,
						fetchDef,
						[fetchSearch],
						fetchAll
					) ?? []
			)
		)

		return files.flat()
	},
})

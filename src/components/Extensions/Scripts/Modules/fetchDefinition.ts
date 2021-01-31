import { App } from '@/App'
import { IModuleConfig } from '../types'

export const FetchDefinitionModule = ({}: IModuleConfig) => ({
	fetchDefinition: (
		fileType: string,
		fetchDefs: string[],
		fetchSearch: string,
		fetchAll = false
	) => {
		return new Promise<string[]>(resolve => {
			App.ready.once(app =>
				app.packIndexer.once(async () => {
					const files = await Promise.all(
						fetchDefs.map(fetchDef =>
							app.packIndexer.service.find(
								fileType,
								fetchDef,
								[fetchSearch],
								fetchAll
							)
						)
					)
					resolve(files.flat())
				})
			)
		})
	},
})

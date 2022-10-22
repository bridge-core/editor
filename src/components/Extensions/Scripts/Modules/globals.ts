import { IModuleConfig } from '../types'
import { App } from '/@/App'

let cachedGlobals: Record<string, unknown> | undefined = undefined

// App.eventSystem.on('projectChanged', () => {
// 	cachedGlobals = undefined
// })

export const GlobalsModule = async ({}: IModuleConfig) => {
	try {
		if (cachedGlobals === undefined) {
			return new Promise<Record<string, unknown>>((resolve) => {
				App.ready.once(async (app) => {
					cachedGlobals = await app.fileSystem
						.readJSON(`${app.project.projectPath}/globals.json`)
						.catch(() => {})
					resolve(cachedGlobals!)
				})
			})
		}
	} catch {
		return {}
	}

	return { ...cachedGlobals }
}

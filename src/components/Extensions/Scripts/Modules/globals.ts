import { IModuleConfig } from '../types'
import { join } from 'path'
import { App } from '@/App'
import { selectedProject } from '@/components/Project/Loader'

let cachedGlobals: Record<string, unknown> | undefined = undefined

// App.eventSystem.on('projectChanged', () => {
// 	cachedGlobals = undefined
// })

export const GlobalsModule = async ({}: IModuleConfig) => {
	try {
		if (cachedGlobals === undefined) {
			return new Promise<Record<string, unknown>>(resolve => {
				App.ready.once(async app => {
					cachedGlobals = await app.fileSystem.readJSON(
						`projects/${selectedProject}/globals.json`
					)
					resolve(cachedGlobals!)
				})
			})
		}
	} catch {
		return {}
	}

	return { ...cachedGlobals }
}

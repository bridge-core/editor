import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { IModuleConfig } from '../types'

export const ComMojangModule = async ({}: IModuleConfig) => {
	const app = await App.getApp()

	return {
		setup: app.comMojang.setup,
		requestFileSystem: async () => {
			const fs: any = {}

			// Extensions will destructure the fileSystem instance
			// so we actually need to add its methods to a temp object
			// and rebind them to the class instance
			for (const key of Object.getOwnPropertyNames(
				Object.getPrototypeOf(app.comMojang.fileSystem)
			)) {
				if (
					key !== 'constructor' &&
					typeof (<any>app.comMojang.fileSystem)[key] === 'function'
				)
					fs[key] = (<any>app.comMojang.fileSystem)[key].bind(
						app.comMojang.fileSystem
					)
			}

			return <FileSystem>fs
		},
	}
}

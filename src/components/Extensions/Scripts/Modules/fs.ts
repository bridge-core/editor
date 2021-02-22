import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { IModuleConfig } from '../types'

export const FSModule = ({}: IModuleConfig) => {
	return new Promise<FileSystem>(resolve => {
		App.ready.once(app => {
			const res: any = {}

			// Extensions will destrcuture the fileSystem instance
			// so we actually need to add its methods to a temp object
			// and rebind them to the class instance
			for (const key of Object.getOwnPropertyNames(
				Object.getPrototypeOf(app.fileSystem)
			)) {
				if (
					key !== 'constructor' &&
					typeof (<any>app.fileSystem)[key] === 'function'
				)
					res[key] = (<any>app.fileSystem)[key].bind(app.fileSystem)
			}

			resolve(res)
		})
	})
}

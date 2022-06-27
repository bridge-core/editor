import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { IModuleConfig } from '../types'

export const FSModule = ({ disposables }: IModuleConfig) => {
	return new Promise<FileSystem>((resolve) => {
		App.ready.once((app) => {
			const res: any = {
				onBridgeFolderSetup: (cb: () => Promise<void> | void) => {
					disposables.push(app.bridgeFolderSetup.once(cb, true))
				},
			}

			// Extensions will destructure the fileSystem instance
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

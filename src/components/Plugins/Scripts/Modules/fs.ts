import { App } from '@/App'
import { FileSystem } from '@/components/FileSystem/Main'
import { IModuleConfig } from '../types'

export const FSModule = ({}: IModuleConfig) => {
	return new Promise<FileSystem>(resolve => {
		App.ready.once(app => {
			resolve(app.fileSystem)
		})
	})
}

import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

export function getFileSystem() {
	return new Promise<FileSystem>(resolve => {
		App.ready.once(app => {
			resolve(app.fileSystem)
		})
	})
}

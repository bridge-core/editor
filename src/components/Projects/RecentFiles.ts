import { App } from '@/App'
import { PersistentQueue } from '../Common/PersistentQueue'

export interface IRecentFile {
	icon: string
	color?: string
	name: string
	path: string
}

export class RecentFiles extends PersistentQueue<IRecentFile> {
	constructor(app: App, savePath: string) {
		super(app, 5, savePath)
	}

	isEquals(file1: IRecentFile, file2: IRecentFile) {
		return file1.path === file2.path
	}
}

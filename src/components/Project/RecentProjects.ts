import { App } from '@/App'
import { PersistentQueue } from '../Common/PersistentQueue'
import { IProjectData } from './Project'

export class RecentProjects extends PersistentQueue<IProjectData> {
	constructor(app: App, savePath: string) {
		super(app, 5, savePath)
	}

	isEquals(file1: IProjectData, file2: IProjectData) {
		return file1.path === file2.path
	}
}

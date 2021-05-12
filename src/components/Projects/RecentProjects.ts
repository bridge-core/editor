import { App } from '/@/App'
import { PersistentQueue } from '../Common/PersistentQueue'
import { IProjectData } from './Project/Project'

export class RecentProjects extends PersistentQueue<Partial<IProjectData>> {
	constructor(app: App, savePath: string) {
		super(app, 5, savePath)
	}

	protected isEquals(
		file1: Partial<IProjectData>,
		file2: Partial<IProjectData>
	) {
		return file1.path === file2.path
	}
}

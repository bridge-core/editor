import { App } from '@/App'
import { PersistentQueue } from '@/components/Common/PersistentQueue'
import { TabSystem } from '@/components/TabSystem/TabSystem'

export class OpenedFiles extends PersistentQueue<string> {
	constructor(tabSystem: TabSystem, app: App, savePath: string) {
		super(app, Infinity, savePath)

		this.on(queue =>
			queue.elements.forEach((filePath, i) =>
				tabSystem.open(filePath, i + 1 === queue.elementCount)
			)
		)
	}
}

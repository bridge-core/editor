import { App } from '/@/App'
import { setupFileCategory } from './Category/file'
import { setupHelpCategory } from './Category/help'
import { setupToolsCategory } from './Category/tools'
import { setupProjectCategory } from './Category/project'

export async function setupDefaultMenus(app: App) {
	setupProjectCategory(app)
	setupFileCategory(app)
	setupToolsCategory(app)
	setupHelpCategory(app)
}

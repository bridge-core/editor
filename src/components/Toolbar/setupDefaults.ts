import { App } from '/@/App'
import { setupEditCategory } from './Category/edit'
import { setupFileCategory } from './Category/file'
import { setupHelpCategory } from './Category/help'
import { setupToolsCategory } from './Category/tools'

export async function setupDefaultMenus(app: App) {
	setupFileCategory(app)
	setupEditCategory(app)
	setupToolsCategory(app)
	setupHelpCategory(app)
}

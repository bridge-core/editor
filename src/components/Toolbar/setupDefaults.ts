import { App } from '/@/App'
import { setupEditCategory } from './Category/edit'
import { setupFileCategory } from './Category/file'
import { setupHelpCategory } from './Category/help'
import { setupToolsCategory } from './Category/tools'
import { setupProjectCategory } from './Category/project'
import { setupViewCategory } from './Category/view'

export async function setupDefaultMenus(app: App) {
	setupProjectCategory(app)
	setupFileCategory(app)
	setupEditCategory(app)
	setupViewCategory(app)
	setupToolsCategory(app)
	setupHelpCategory(app)
}

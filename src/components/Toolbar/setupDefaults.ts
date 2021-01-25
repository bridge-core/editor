import { App } from '@/App'
import { createAppMenu } from './create'
import { FileMenu } from './Category/file'
import { HelpMenu } from './Category/help'
import { ToolMenu } from './Category/tools'
import { EditMenu } from './Category/edit'
import type { IDisposable } from '@/types/disposable'


let CATEGORIES = [FileMenu, EditMenu, ToolMenu, HelpMenu]
let DISPOSABLES: IDisposable[] = []

export async function setupDefaultMenus() {
	const app = await App.getApp()
	DISPOSABLES.forEach(dis => dis.dispose())
	DISPOSABLES = CATEGORIES.map(c => createAppMenu(app.keyBindingManager, c))

	// if (Store.state.Settings.is_dev_mode) {
	// 	DEV_MENU.add()
	// }
}

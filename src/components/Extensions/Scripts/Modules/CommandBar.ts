import { IModuleConfig } from '../types'
import { SimpleAction, IActionConfig } from '/@/components/Actions/SimpleAction'

export const CommandBarExtensionItems = new Set<SimpleAction>()

export const CommandBarModule = ({ disposables }: IModuleConfig) => {
	return {
		registerAction(actionConfig: IActionConfig) {
			const action = new SimpleAction(actionConfig)
			CommandBarExtensionItems.add(action)

			const disposable = {
				dispose: () => {
					CommandBarExtensionItems.delete(action)
				},
			}

			disposables.push(disposable)

			return disposable
		},
	}
}

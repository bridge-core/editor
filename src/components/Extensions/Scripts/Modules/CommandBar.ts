import { IModuleConfig } from '../types'
import { SimpleAction } from '/@/components/Actions/SimpleAction'

export const CommandBarExtensionItems = new Set<SimpleAction>()

export const CommandBarModule = ({ disposables }: IModuleConfig) => {
	return {
		registerAction(action: SimpleAction) {
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

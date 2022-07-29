import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { ExtensionViewer } from './ExtensionViewer'

export const extensionActions = (extension: ExtensionViewer) => [
	new SimpleAction({
		name: `windows.extensionStore.deleteExtension`,
		icon: 'mdi-delete',
		onTrigger: () => {
			extension.delete()
			extension.closeActionMenu()
		},
	}),
	new SimpleAction({
		name: `windows.extensionStore.${
			extension.isActive ? 'deactivateExtension' : 'activateExtension'
		}`,
		icon: extension.isActive ? 'mdi-close' : 'mdi-check',
		onTrigger: () => {
			extension.setActive(!extension.isActive)
			extension.closeActionMenu()
		},
	}),
	!extension.isInstalledLocallyAndGlobally
		? new SimpleAction({
				name: `windows.extensionStore.${
					extension.isGlobal ? 'installLocal' : 'installGlobal'
				}`,
				icon: 'mdi-download',
				onTrigger: () => {
					extension.download(!extension.isGlobal)
					extension.closeActionMenu()
				},
		  })
		: null,
]

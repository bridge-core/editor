import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { ExtensionViewer } from './ExtensionViewer'
import { App } from '/@/App'

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
	// Only show "Install Local"/"Install Global" action if the extension isn't installed locally and globally yet
	// ...and if the user is not currently on the "Home View"
	!extension.isInstalledLocallyAndGlobally &&
	!App.instance.isNoProjectSelected
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

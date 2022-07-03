import { App } from '/@/App'
import { ButtonToggle } from './Controls/ButtonToggle/ButtonToggle'
import { Toggle } from './Controls/Toggle/Toggle'
import { SettingsWindow } from './SettingsWindow'
import { ActionViewer } from './Controls/ActionViewer/ActionViewer'
import { Selection } from './Controls/Selection/Selection'
import { BridgeConfigSelection } from './Controls/Selection/BridgeConfigSelection'
import { Button } from './Controls/Button/Button'
import { del, set } from 'idb-keyval'
import { comMojangKey } from '../../FileSystem/ComMojang'
import { Sidebar } from './Controls/Sidebar/Sidebar'
import {
	isUsingFileSystemPolyfill,
	isUsingOriginPrivateFs,
} from '/@/components/FileSystem/Polyfill'
import { platform } from '/@/utils/os'
import { TextField } from './Controls/TextField/TextField'
import { devActions } from '../../Developer/Actions'
import { SimpleAction } from '../../Actions/SimpleAction'

export async function setupSettings(settings: SettingsWindow) {
	settings.addControl(
		new ButtonToggle({
			category: 'appearance',
			name: 'windows.settings.appearance.colorScheme.name',
			description: 'windows.settings.appearance.colorScheme.description',
			key: 'colorScheme',
			options: ['auto', 'dark', 'light'],
			default: 'auto',
			onChange: () => {
				App.getApp().then((app) => app.themeManager.updateTheme())
			},
		})
	)
	settings.addControl(
		new Selection({
			category: 'appearance',
			name: 'windows.settings.appearance.darkTheme.name',
			description: 'windows.settings.appearance.darkTheme.description',
			key: 'darkTheme',
			get options() {
				return settings.parent.themeManager
					.getThemes('dark')
					.map((theme) => ({ text: theme.name, value: theme.id }))
			},
			default: 'bridge.default.dark',
			onChange: () => {
				App.getApp().then((app) => app.themeManager.updateTheme())
			},
		})
	)
	settings.addControl(
		new Selection({
			category: 'appearance',
			name: 'windows.settings.appearance.lightTheme.name',
			description: 'windows.settings.appearance.lightTheme.description',
			key: 'lightTheme',
			get options() {
				return settings.parent.themeManager
					.getThemes('light')
					.map((theme) => ({ text: theme.name, value: theme.id }))
			},
			default: 'bridge.default.light',
			onChange: () => {
				App.getApp().then((app) => app.themeManager.updateTheme())
			},
		})
	)
	settings.addControl(
		new BridgeConfigSelection({
			category: 'appearance',
			name: 'windows.settings.appearance.localDarkTheme.name',
			description:
				'windows.settings.appearance.localDarkTheme.description',
			key: 'darkTheme',
			get options() {
				return settings.parent.themeManager
					.getThemes('dark', false)
					.map((theme) => ({ text: theme.name, value: theme.id }))
					.concat([{ text: 'None', value: 'bridge.noSelection' }])
			},
			default: 'bridge.noSelection',
			onChange: () => {
				App.getApp().then((app) => app.themeManager.updateTheme())
			},
		})
	)
	settings.addControl(
		new BridgeConfigSelection({
			category: 'appearance',
			name: 'windows.settings.appearance.localLightTheme.name',
			description:
				'windows.settings.appearance.localLightTheme.description',
			key: 'lightTheme',
			get options() {
				return settings.parent.themeManager
					.getThemes('light', false)
					.map((theme) => ({ text: theme.name, value: theme.id }))
					.concat([{ text: 'None', value: 'bridge.noSelection' }])
			},
			default: 'bridge.noSelection',
			onChange: () => {
				App.getApp().then((app) => app.themeManager.updateTheme())
			},
		})
	)
	settings.addControl(
		new Selection({
			category: 'appearance',
			name: 'windows.settings.appearance.font.name',
			description: 'windows.settings.appearance.font.description',
			key: 'font',
			default: 'Roboto',
			options: [
				'Roboto',
				'Arial',
				'Verdana',
				'Helvetica',
				'Tahome',
				'Trebuchet MS',
				'Menlo',
				'Monaco',
				'Courier New',
				'monospace',
			],
		})
	)
	settings.addControl(
		new Selection({
			category: 'appearance',
			name: 'windows.settings.appearance.editorFont.name',
			description: 'windows.settings.appearance.editorFont.description',
			key: 'editorFont',
			default: platform() === 'darwin' ? 'Menlo' : 'Consolas',
			options: [
				'Roboto',
				'Arial',
				'Consolas',
				'Menlo',
				'Monaco',
				'"Courier New"',
				'monospace',
			],
			onChange: async (val) => {
				const app = await App.getApp()
				app.projectManager.updateAllEditorOptions({
					fontFamily: val,
				})
			},
		})
	)
	settings.addControl(
		new Selection({
			category: 'appearance',
			name: 'windows.settings.appearance.editorFontSize.name',
			description:
				'windows.settings.appearance.editorFontSize.description',
			key: 'editorFontSize',
			default: '14px',
			options: ['8px', '10px', '12px', '14px', '16px', '18px', '20px'],
			onChange: async (val) => {
				const app = await App.getApp()
				app.projectManager.updateAllEditorOptions({
					fontSize: Number(val.replace('px', '')),
				})
			},
		})
	)
	settings.addControl(
		new Toggle({
			category: 'sidebar',
			name: 'windows.settings.sidebar.sidebarRight.name',
			description: 'windows.settings.sidebar.sidebarRight.description',
			key: 'isSidebarRight',
			default: false,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'sidebar',
			name: 'windows.settings.sidebar.shrinkSidebarElements.name',
			description:
				'windows.settings.sidebar.shrinkSidebarElements.description',
			key: 'smallerSidebarElements',
			default: false,
		})
	)
	settings.addControl(
		new ButtonToggle({
			category: 'sidebar',
			name: 'windows.settings.sidebar.sidebarSize.name',
			description: 'windows.settings.sidebar.sidebarSize.description',
			key: 'sidebarSize',
			options: ['tiny', 'small', 'normal', 'large'],
			default: 'normal',
			onChange: () => {
				App.getApp().then((app) => app.windowResize.dispatch())
			},
		})
	)
	settings.addControl(
		new Sidebar({
			category: 'sidebar',
			name: 'windows.settings.sidebar.shrinkSidebarElements.name',
			description:
				'windows.settings.sidebar.shrinkSidebarElements.description',
			key: 'hideElements',
		})
	)

	const locales = await App.getApp().then((app) => app.locales)
	settings.addControl(
		new Selection({
			category: 'general',
			name: 'windows.settings.general.language.name',
			description: 'windows.settings.general.language.description',
			key: 'locale',
			get options() {
				return locales.getLanguages().map((lang) => ({
					text: lang[1],
					value: lang[0],
				}))
			},
			default: locales.getCurrentLanguage(),
			onChange: (val) => {
				locales.selectLanguage(val)
			},
		})
	)

	settings.addControl(
		new Toggle({
			category: 'general',
			name: 'windows.settings.general.collaborativeMode.name',
			description:
				'windows.settings.general.collaborativeMode.description',
			key: 'fullLightningCacheRefresh',
			default: true,
		})
	)
	// TODO(Dash): Re-enable pack spider
	// settings.addControl(
	// 	new Toggle({
	// 		category: 'general',
	// 		name: 'windows.settings.general.packSpider.name',
	// 		description: 'windows.settings.general.packSpider.description',
	// 		key: 'enablePackSpider',
	// 		default: false,
	// 	})
	// )

	settings.addControl(
		new Toggle({
			category: 'general',
			name: 'windows.settings.general.formatOnSave.name',
			description: 'windows.settings.general.formatOnSave.description',
			key: 'formatOnSave',
			default: true,
		})
	)

	settings.addControl(
		new Toggle({
			category: 'general',
			name: 'windows.settings.general.openLinksInBrowser.name',
			description:
				'windows.settings.general.openLinksInBrowser.description',
			key: 'openLinksInBrowser',
			default: false,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'general',
			name: 'windows.settings.general.restoreTabs.name',
			description: 'windows.settings.general.restoreTabs.description',
			key: 'restoreTabs',
			default: true,
		})
	)
	if (!isUsingFileSystemPolyfill.value) {
		settings.addControl(
			new Button({
				category: 'general',
				name: 'windows.settings.general.resetBridgeFolder.name',
				description:
					'windows.settings.general.resetBridgeFolder.description',
				onClick: async () => {
					await del('bridgeBaseDir')
					await del(comMojangKey)
					location.reload()
				},
			})
		)
	}
	// Editor
	settings.addControl(
		new Selection({
			category: 'editor',
			name: 'windows.settings.editor.jsonEditor.name',
			description: 'windows.settings.editor.jsonEditor.description',
			key: 'jsonEditor',
			options: [
				{ text: 'Tree Editor', value: 'treeEditor' },
				{ text: 'Raw Text', value: 'rawText' },
			],
			default: 'rawText',
		})
	)
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.bridgePredictions.name',
			description:
				'windows.settings.editor.bridgePredictions.description',
			key: 'bridgePredictions',
			default: true,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.bracketPairColorization.name',
			description:
				'windows.settings.editor.bracketPairColorization.description',
			key: 'bracketPairColorization',
			default: false,
			onChange: async (val) => {
				const app = await App.getApp()
				app.projectManager.updateAllEditorOptions({
					// @ts-expect-error The monaco team did not update the types yet
					'bracketPairColorization.enabled': val,
				})
			},
		})
	)
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.wordWrap.name',
			description: 'windows.settings.editor.wordWrap.description',
			key: 'wordWrap',
			default: false,
			onChange: async (val) => {
				const app = await App.getApp()
				app.projectManager.updateAllEditorOptions({
					wordWrap: val ? 'bounded' : 'off',
				})
			},
		})
	)
	settings.addControl(
		new Selection({
			category: 'editor',
			name: 'windows.settings.editor.wordWrapColumns.name',
			description: 'windows.settings.editor.wordWrapColumns.description',
			key: 'wordWrapColumns',
			default: '80',
			options: ['40', '60', '80', '100', '120', '140', '160'],
			onChange: async (val) => {
				const app = await App.getApp()
				app.projectManager.updateAllEditorOptions({
					wordWrapColumn: Number(val),
				})
			},
		})
	)
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.compactTabDesign.name',
			description: 'windows.settings.editor.compactTabDesign.description',
			key: 'compactTabDesign',
			default: true,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.automaticallyOpenTreeNodes.name',
			description:
				'windows.settings.editor.automaticallyOpenTreeNodes.description',
			key: 'automaticallyOpenTreeNodes',
			default: true,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.dragAndDropTreeNodes.name',
			description:
				'windows.settings.editor.dragAndDropTreeNodes.description',
			key: 'dragAndDropTreeNodes',
			default: true,
		})
	)

	// Projects
	settings.addControl(
		new TextField({
			category: 'projects',
			name: 'windows.settings.projects.defaultAuthor.name',
			description: 'windows.settings.projects.defaultAuthor.description',
			key: 'defaultAuthor',
			default: '',
		})
	)
	settings.addControl(
		new Toggle({
			category: 'projects',
			name: 'windows.settings.projects.incrementVersionOnExport.name',
			description:
				'windows.settings.projects.incrementVersionOnExport.description',
			key: 'incrementVersionOnExport',
			default: isUsingOriginPrivateFs || isUsingFileSystemPolyfill.value,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'projects',
			name: 'windows.settings.projects.addGeneratedWith.name',
			description:
				'windows.settings.projects.addGeneratedWith.description',
			key: 'addGeneratedWith',
			default: true,
		})
	)

	// Actions
	const app = await App.getApp()
	Object.values(app.actionManager.state).forEach((action) => {
		if (action.type === 'action')
			settings.addControl(new ActionViewer(action))
	})

	if (import.meta.env.DEV) {
		settings.addControl(
			new ButtonToggle({
				category: 'developers',
				name: 'windows.settings.developer.simulateOS.name',
				description:
					'windows.settings.developer.simulateOS.description',
				key: 'simulateOS',
				options: ['auto', 'win32', 'darwin', 'linux'],
				default: 'auto',
			})
		)
		settings.addControl(
			new Toggle({
				category: 'developers',
				name: 'windows.settings.developer.devMode.name',
				description: 'windows.settings.developer.devMode.description',
				key: 'isDevMode',
			})
		)
		settings.addControl(
			new Toggle({
				category: 'developers',
				name: 'windows.settings.developer.forceDataDownload.name',
				description:
					'windows.settings.developer.forceDataDownload.description',
				key: 'forceDataDownload',
				default: false,
			})
		)

		devActions.forEach((action) => {
			settings.addControl(new ActionViewer(action, 'developers'))
		})
	}
}

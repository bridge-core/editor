import { App } from '/@/App'
import { ButtonToggle } from './Controls/ButtonToggle/ButtonToggle'
import { Toggle } from './Controls/Toggle/Toggle'
import { SettingsWindow } from './SettingsWindow'
import { ActionViewer } from './Controls/ActionViewer/ActionViewer'
import { Selection } from './Controls/Selection/Selection'
import { BridgeConfigSelection } from './Controls/Selection/BridgeConfigSelection'
import { Button } from './Controls/Button/Button'
import { del, get, set } from 'idb-keyval'
import { comMojangKey } from '/@/components/OutputFolders/ComMojang/ComMojang'
import { Sidebar } from './Controls/Sidebar/Sidebar'
import {
	isUsingFileSystemPolyfill,
	isUsingOriginPrivateFs,
} from '/@/components/FileSystem/Polyfill'
import { platform } from '/@/utils/os'
import { TextField } from './Controls/TextField/TextField'
import { devActions } from '/@/components/Developer/Actions'
import { FontSelection } from './Controls/FontSelection'
import { LocaleManager } from '../../Locales/Manager'
import { showFolderPicker } from '../../FileSystem/Pickers/showFolderPicker'
import { pathFromHandle } from '../../FileSystem/Virtual/pathFromHandle'

export async function setupSettings(settings: SettingsWindow) {
	const app = await App.getApp()

	settings.addControl(
		new ButtonToggle({
			category: 'appearance',
			name: 'windows.settings.appearance.colorScheme.name',
			description: 'windows.settings.appearance.colorScheme.description',
			key: 'colorScheme',
			options: ['auto', 'dark', 'light'],
			default: 'auto',
			onChange: () => {
				app.themeManager.updateTheme()
			},
		})
	)
	settings.addControl(
		new Toggle({
			category: 'appearance',
			name: 'windows.settings.appearance.highContrast.name',
			description: 'windows.settings.appearance.highContrast.description',
			key: 'highContrast',
			default: false,
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
				app.themeManager.updateTheme()
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
				app.themeManager.updateTheme()
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
				app.themeManager.updateTheme()
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
				app.themeManager.updateTheme()
			},
		})
	)
	settings.addControl(
		new FontSelection({
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
		new FontSelection({
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
				app.projectManager.updateAllEditorOptions({
					fontSize: Number(val.replace('px', '')),
				})
			},
		})
	)
	settings.addControl(
		new Toggle({
			category: 'appearance',
			name: 'windows.settings.appearance.hideToolbarItems.name',
			description:
				'windows.settings.appearance.hideToolbarItems.description',
			key: 'hideToolbarItems',
			default: false,
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
				app.windowResize.dispatch()
			},
		})
	)
	settings.addControl(
		new ButtonToggle({
			category: 'sidebar',
			name: 'windows.settings.sidebar.packExplorerFolderIndentation.name',
			description:
				'windows.settings.sidebar.packExplorerFolderIndentation.description',
			key: 'packExplorerFolderIndentation',
			options: ['small', 'normal', 'large', 'x-large'],
			default: 'normal',
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
	settings.addControl(
		new Selection({
			omitFromSaveFile: true,
			category: 'general',
			name: 'windows.settings.general.language.name',
			description: 'windows.settings.general.language.description',
			key: 'locale',
			options: LocaleManager.getAvailableLanguages(),
			default: LocaleManager.getCurrentLanguageId(),
			onChange: (val) => {
				settings.addReloadHint()
				set('language', val)
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
	if (import.meta.env.VITE_IS_TAURI_APP || !isUsingFileSystemPolyfill.value) {
		settings.addControl(
			new Button({
				category: 'general',
				name: 'windows.settings.general.selectBridgeFolder.name',
				description:
					'windows.settings.general.selectBridgeFolder.description',
				onClick: async () => {
					if (import.meta.env.VITE_IS_TAURI_APP) {
						// Native app
						const [folderHandle] =
							(await showFolderPicker({ multiple: false })) ?? []
						if (!folderHandle) return

						const folderPath = await pathFromHandle(folderHandle)
						set('bridgeFolderPath', folderPath)

						settings.addReloadHint()
					} else {
						// PWA
						await del('bridgeBaseDir')
						await del(comMojangKey)
						location.reload()
					}
				},
			})
		)
	}
	// Only show reset bridge folder on native app if a different bridge folder is set
	if (
		import.meta.env.VITE_IS_TAURI_APP &&
		(await get<string | undefined>('bridgeFolderPath')) !== undefined
	) {
		settings.addControl(
			new Button({
				category: 'general',
				name: 'windows.settings.general.resetBridgeFolder.name',
				description:
					'windows.settings.general.resetBridgeFolder.description',
				onClick: async () => {
					set('bridgeFolderPath', undefined)
					settings.addReloadHint()
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
			name: 'windows.settings.editor.bracketPairColorization.name',
			description:
				'windows.settings.editor.bracketPairColorization.description',
			key: 'bracketPairColorization',
			default: false,
			onChange: async (val) => {
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
			name: 'windows.settings.editor.keepTabsOpen.name',
			description: 'windows.settings.editor.keepTabsOpen.description',
			key: 'keepTabsOpen',
			default: false,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.autoSaveChanges.name',
			description: 'windows.settings.editor.autoSaveChanges.description',
			key: 'autoSaveChanges',
			default: app.mobile.isCurrentDevice(), // Auto save should be on by default on mobile
		})
	)

	// Tree Editor specific settings
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.showTreeEditorLocationBar.name',
			description:
				'windows.settings.editor.showTreeEditorLocationBar.description',
			key: 'showTreeEditorLocationBar',
			default: true,
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
			name: 'windows.settings.editor.inlineTreeEditorDiagnostics.name',
			description:
				'windows.settings.editor.inlineTreeEditorDiagnostics.description',
			key: 'inlineTreeEditorDiagnostics',
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
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.showArrayIndices.name',
			description: 'windows.settings.editor.showArrayIndices.description',
			key: 'showArrayIndices',
			default: false,
		})
	)
	settings.addControl(
		new Toggle({
			category: 'editor',
			name: 'windows.settings.editor.hideBracketsWithinTreeEditor.name',
			description:
				'windows.settings.editor.hideBracketsWithinTreeEditor.description',
			key: 'hideBracketsWithinTreeEditor',
			default: false,
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
			name: 'windows.settings.projects.loadComMojangProjects.name',
			description:
				'windows.settings.projects.loadComMojangProjects.description',
			key: 'loadComMojangProjects',
			default: true,
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

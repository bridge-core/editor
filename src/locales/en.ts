import { en } from 'vuetify/src/locale'

export default {
	...en,
	languageName: 'English',
	// Common translations - should help stop unnecessarily repeating keys
	general: {
		yes: 'Yes',
		no: 'No',
		okay: 'Okay',
		confirm: 'Confirm',
		cancel: 'Cancel',
		close: 'Close',
		reload: 'Reload',
		information: 'Information',
		continue: 'Continue',
		delete: 'Delete',
		select: 'Select',
		skip: 'Skip',
		selectFolder: 'Select Folder',
		fileName: 'File Name',
		confirmOverwriteFile:
			'A file with this name already exists. Do you want to overwrite it?',
		fileSystemPolyfill:
			'Due to the browser you are using, you need to download your projects in order to actually save your progress. This is not necessary if you are using Chrome or Edge!',
		successfulExport: {
			title: 'Export Successful',
			description: 'You can find the exported package here',
		},
		inactive: 'Inactive',
		active: 'Active',
	},
	packType: {
		behaviorPack: {
			name: 'Behavior Pack',
			description:
				'Create new game mechanics and change how Minecraft behaves',
		},
		resourcePack: {
			name: 'Resource Pack',
			description: "Used for changing Minecraft's look and sound",
		},
		skinPack: {
			name: 'Skin Pack',
			description:
				'Provide new appearances a player can select for their character',
		},
		worldTemplate: {
			name: 'World Template',
			description:
				'Create a world that users can create to experience your project',
		},
	},
	// File Type display names
	fileType: {
		manifest: 'Manifest',
		animation: 'Animation',
		animationController: 'Animation Controller',
		biome: 'Biome',
		block: 'Block',
		bridgeConfig: 'Project Config',
		dialogue: 'Dialogue',
		entity: 'Entity',
		feature: 'Feature',
		featureRule: 'Feature Rule',
		functionTick: 'Function Tick',
		function: 'Function',
		item: 'Item',
		lootTable: 'Loot Table',
		recipe: 'Recipe',
		clientScript: 'Client Script',
		serverScript: 'Server Script',
		script: 'Script',
		spawnRule: 'Spawn Rule',
		mcstructure: 'Structure',
		tradeTable: 'Trade Table',
		clientManifest: 'Client Manifest',
		skinManifest: 'Skin Manifest',
		geometry: 'Geometry',
		customCommand: 'Command',
		customComponent: 'Component',
		clientAnimation: 'Client Animation',
		clientAnimationController: 'Client Animation Controller',
		attachable: 'Attachable',
		clientEntity: 'Client Entity',
		clientItem: 'Client Item',
		clientLang: 'Language',
		fog: 'Fog',
		particle: 'Particle',
		renderController: 'Render Controller',
		texture: 'Texture',
		textureSet: 'Texture Set',
		itemTexture: 'Item Texture',
		clientBlock: 'Client Block',
		terrainTexture: 'Terrain Texture',
		flipbookTexture: 'Flipbook Texture',
		clientBiome: 'Client Biome',
		soundDefinition: 'Sound Definition',
		musicDefinition: 'Music Definition',
		clientSound: 'Client Sound',
		skins: 'Skins',
		langDef: 'Language Definitions',
		lang: 'Language',
		molang: 'Molang',
		gameTest: 'Game Test',
		unknown: 'Other',
		simpleFile: 'Simple Files',
		ui: 'UI',
		volume: 'Volume',
		worldManifest: 'World Manifest',
	},
	// Actions
	actions: {
		newProject: {
			name: 'New Project',
			description: 'Create a new bridge. project',
		},
		newFile: {
			name: 'New File',
			description: 'Create a new Add-On feature',
		},
		openFile: {
			name: 'Open File',
			description: 'Open a file from the current project',
		},
		searchFile: {
			name: 'Search File',
			description: 'Search and open a file from the current project',
		},
		saveFile: {
			name: 'Save File',
			description: 'Save the currently opened file',
		},
		saveAs: {
			name: 'Save As',
			description:
				'Save the currently opened file under a different name',
		},
		saveAll: {
			name: 'Save All',
			description: 'Save all currently opened files',
		},
		closeFile: {
			name: 'Close File',
			description: 'Close the currently opened file',
		},
		settings: {
			name: 'Settings',
			description: "Open bridge.'s app settings",
		},
		extensions: {
			name: 'Extensions',
			description: 'Install and manage your installed extensions',
		},
		copy: {
			name: 'Copy',
			description: 'Copy selected text to the clipboard',
		},
		cut: {
			name: 'Cut',
			description:
				'Copy selected text to the clipboard and remove it from the original context',
		},
		paste: {
			name: 'Paste',
			description: 'Paste clipboard content',
		},
		docs: {
			name: 'Documentation',
			description: 'Opens the Minecraft Add-On documentation',
		},
		releases: {
			name: 'Releases',
			description: 'View the latest bridge. releases',
		},
		bugReports: {
			name: 'Bug Reports',
			description: 'Report an issue with bridge.',
		},
		extensionAPI: {
			name: 'Extension API',
			description: "Read more about bridge.'s extension API",
		},
		gettingStarted: {
			name: 'Getting Started',
			description: 'Read our guide on how to get started with bridge.',
		},
		faq: {
			name: 'FAQ',
			description:
				'Read through frequently asked questions about developing Add-Ons with bridge.',
		},
		reloadAutoCompletions: {
			name: 'Reload Auto-Completions',
			description: 'Reloads all auto-completion data',
		},
		reloadExtensions: {
			name: 'Reload Extensions',
			description: 'Reloads all extensions',
		},
		moveToSplitScreen: {
			name: 'Move to Split Screen',
			description: 'Opens a split screen view and moves this tab to it',
		},
		closeTab: {
			name: 'Close Tab',
			description: 'Close this tab',
		},
		closeAll: {
			name: 'Close All',
			description: 'Close all tabs',
		},
		closeTabsToRight: {
			name: 'Close Tabs to the Right',
			description: 'Close all tabs to the right-hand side of this tab',
		},
		closeAllSaved: {
			name: 'Close All Saved',
			description: 'Close all saved tabs',
		},
		closeOtherTabs: {
			name: 'Close other Tabs',
			description: 'Close all tabs except this tab',
		},
		clearAllNotifications: {
			name: 'Clear All Notifications',
			description: 'Clears all current notifications',
		},
		pluginInstallLocation: {
			global: {
				name: 'Install Globally',
				description:
					'Global extensions are accessible in all of your projects',
			},
			local: {
				name: 'Install Locally',
				description:
					'Local extensions are only accessible inside of the projects you add them to',
			},
		},
		toObject: {
			name: 'Transform to Object',
		},
		toArray: {
			name: 'Transform to Array',
		},
		documentationLookup: {
			name: 'View Documentation',
			noDocumentation: 'No documentation available for',
		},
		toggleReadOnly: {
			name: 'Toggle Read-Only Mode',
			description: 'Toggle read-only mode for the currently opened file',
		},
	},
	// Toolbar Categories
	toolbar: {
		file: {
			name: 'File',
			preferences: {
				name: 'Preferences',
			},
		},
		edit: {
			name: 'Edit',
		},
		tools: {
			name: 'Tools',
		},
		help: {
			name: 'Help',
		},
	},
	// Sidebar tabs
	sidebar: {
		compiler: {
			name: 'Compiler',
			default: {
				name: 'Default Config',
				description:
					'Run bridge.\'s compiler with the default compiler configuration that is part of your project\'s "config.json" file.',
			},
		},
		extensions: {
			name: 'Extensions',
		},

		notifications: {
			socials: {
				message: 'Socials',
			},
			gettingStarted: {
				message: 'Getting Started',
			},
			installApp: {
				message: 'Install App',
			},
			updateAvailable: {
				message: 'Update Available',
			},
			updateExtensions: 'Update All Extensions',
		},
	},
	// Welcome Screen
	welcome: {
		title: 'Welcome to bridge.',
		subtitle: 'Creating Minecraft addons has never been more convenient!',
		quickActions: 'Quick Actions',
		recentFiles: 'Recent Files',
		recentProjects: 'Recent Projects',
	},
	// Experimental gameplay toggles
	experimentalGameplay: {
		cavesAndCliffs: {
			name: 'Caves and Cliffs',
			description:
				'Enables auto-completions for the new mountain generation inside of biomes.',
		},
		holidayCreatorFeatures: {
			name: 'Holiday Creator Features',
			description:
				'Enables auto-completions for the data driven item and block features.',
		},
		creationOfCustomBiomes: {
			name: 'Creation of Custom Biomes',
			description:
				'Enables the creation of custom biomes, features and feature rules.',
		},
		additionalModdingCapabilities: {
			name: 'Additional Modding Capabilities',
			description:
				'Enables the Scripting API in the manifest and allows you to create scripts with auto-completions.',
		},
		upcomingCreatorFeatures: {
			name: 'Upcoming Creator Features',
			description:
				'Enables the creation of fog volume files and provides auto-completions for entity properties.',
		},
		enableGameTestFramework: {
			name: 'Enable GameTest Framework',
			description:
				'Enables the GameTest related modules in the manifest and allows you to create GameTets scripts with auto-completions.',
		},
	},
	// Windows
	windows: {
		changelogWindow: {
			title: "What's new?",
		},
		openFile: {
			title: 'Open',
			search: 'Search file...',
			noData: 'No results...',
		},
		createProject: {
			welcome: 'Welcome to bridge.!',
			welcomeDescription:
				'Please create your first project in order to get started.',
			omitPack: 'Omit',
			selectedPack: 'Selected',
			title: 'Create Project',
			packIcon: 'Project Icon (optional)',
			projectName: {
				name: 'Project Name',
				invalidLetters: 'You may only use alphanumerical characters',
				mustNotBeEmpty: 'You must enter a project name',
			},
			projectDescription: 'Project Description (optional)',
			projectPrefix: 'Project Prefix',
			projectAuthor: 'Project Author',
			projectTargetVersion: 'Project Target Version',
			scripting: 'Enable Scripting API',
			gameTest: 'Enable GameTest Framework',
			rpAsBpDependency:
				'Register resource pack as behavior pack dependency',
			useLangForManifest:
				'Add pack name/description directly to the manifest',
			create: 'Create',
			saveCurrentProject:
				'Do you want to save your current project before creating the new one? Any unsaved changes will get lost!',
		},
		createPreset: {
			title: 'Create Preset',
			searchPresets: 'Search presets...',
			overwriteFiles:
				'This preset overwrites one or more existing files. Do you want to continue?',
			overwriteFilesConfirm: 'Continue',
			overwriteUnsavedChanges:
				'This preset overwrites one or more files with unsaved changes. Do you want to continue?',
			overwriteUnsavedChangesConfirm: 'Continue',
			validationRule: {
				alphanumeric:
					'You may only use alphanumeric characters and/or underscores',
				lowercase: 'You may only use lowercase letters',
				required: 'This field is required',
				noEmptyFolderNames: 'Folder name may not be empty',
			},
		},
		deleteProject: {
			confirm: 'Delete',
			description: 'Are you sure you want to delete this project?',
		},
		socials: {
			title: 'Socials',
			content:
				'Check out our Twitter, Github and join the official bridge. Discord server!',
			discord: 'Discord',
			twitter: 'Twitter',
			github: 'Github',
		},
		projectChooser: {
			title: 'Projects',
			searchProjects: 'Search projects...',
			newProject: {
				name: 'New Project',
				description: 'Create a new bridge. project.',
			},
			importBrproject: 'Import Project',
			saveCurrentProject: {
				name: 'Save Project',
				description:
					'Download your current project as a .brproject file to save changes that you have made.',
			},
			openNewProject: {
				name: 'Open Project',
				description:
					'Open a different project by selecting the corresponding .brproject file.',
				saveCurrentProject:
					'Do you want to save your current project before loading in the new one?',
			},
			wrongFileType: 'Project must be a .brproject file',
			addPack: 'Add Pack',
		},
		filePath: {
			title: 'Choose File Path',
		},
		packExplorer: {
			title: 'Pack Explorer',
			searchFiles: 'Search files...',
			categories: 'Categories',
			refresh: {
				name: 'Refresh Project',
				description: 'Fetch the current project for newly added files',
			},
			restartDevServer: {
				name: 'Restart Dev Server',
				description:
					"Are you sure that you want to restart the compiler's dev server? This can take some time depending on the size of your project.",
			},
			createPreset: 'New File',
			projectConfig: {
				name: 'Open Project Config',
				missing:
					'It looks like this project has no config.json file. Every project needs a project config in order to work correctly.',
			},
			exportAsMcaddon: {
				name: 'Export as .mcaddon',
			},
			exportAsMctemplate: {
				name: 'Export as .mctemplate',
				chooseWorld: 'Choose a World',
			},
			exportAsMcworld: {
				name: 'Export as .mcworld',
				chooseWorld: 'Choose a World',
			},
			exportAsBrproject: {
				name: 'Export as .brproject',
			},
			fileActions: {
				delete: {
					name: 'Delete',
					description: 'Delete a file or folder',
					confirmText:
						"Are you sure that you want to delete this file? You won't be able to restore it later!",
				},
				rename: {
					name: 'Rename',
					description: 'Rename a file',
				},
				duplicate: {
					name: 'Duplicate',
					description: 'Duplicate a file',
				},
				viewCompilerOutput: {
					name: 'View Compiler Output',
					description:
						'View the current compiler output for this file',
					fileMissing:
						"It doesn't look like this file was compiled yet.",
				},
				revealFilePath: {
					name: 'Reveal File Path',
					description: 'Reveals the location of a file or folder',
				},
				createFile: {
					name: 'Create File',
					description: 'Create a new file',
				},
				createFolder: {
					name: 'Create Folder',
					description: 'Create a new folder',
				},
			},
		},
		settings: {
			title: 'Settings',
			searchSettings: 'Search settings...',
			sidebar: {
				name: 'Sidebar',
				sidebarRight: {
					name: 'Sidebar Right',
					description:
						'Moves the sidebar to the right side of the screen',
				},
				sidebarSize: {
					name: 'Sidebar Size',
					description:
						'Changes the width of the expanded sidebar area.',
				},
				shrinkSidebarElements: {
					name: 'Shrink Sidebar Elements',
					description:
						"Shrink the size of bridge.'s sidebar elements",
				},
			},
			appearance: {
				name: 'Appearance',
				colorScheme: {
					name: 'Color Scheme',
					description: "Choose the color scheme of bridge.'s UI",
				},
				darkTheme: {
					name: 'Dark Theme',
					description: 'Select the default dark theme bridge. uses',
				},
				lightTheme: {
					name: 'Light Theme',
					description: 'Select the default light theme bridge. uses',
				},
				localDarkTheme: {
					name: 'Local Dark Theme',
					description:
						'Choose a dark theme for the currently active project',
				},
				localLightTheme: {
					name: 'Local Light Theme',
					description:
						'Choose a light theme for the currently active project',
				},
			},
			general: {
				name: 'General',
				language: {
					name: 'Language',
					description: 'Choose a language for bridge. to use',
				},
				collaborativeMode: {
					name: 'Collaborative Mode',
					description:
						'Forces full refresh of the cache upon switching projects. Disable when you work alone and you only use bridge. to edit your project',
				},
				packSpider: {
					name: 'Pack Spider',
					description:
						'Pack Spider connects files inside of your projects and presents the connections to you in a virtual file system',
				},
				formatOnSave: {
					name: 'Format On Save',
					description: 'Formats your text files upon saving them',
				},
				openLinksInBrowser: {
					name: 'Open Links in Default Browser',
					description:
						'Open links inside of your default browser instead of a native app window',
				},
				restoreTabs: {
					name: 'Restore Tabs',
					description:
						'Restore your tabs from when you last used bridge. upon opening the app',
				},
				resetBridgeFolder: {
					name: 'Select Root Folder',
					description: 'Choose the main folder bridge. operates on',
				},
			},
			developer: {
				name: 'Developer',
				simulateOS: {
					name: 'Simulate OS',
					description:
						'Simulate a different OS for testing platform specific behavior',
				},
				devMode: {
					name: 'Developer Mode',
					description: 'Enable the developer mode for this app',
				},
			},
			audio: {
				name: 'Audio',
				volume: {
					name: 'Audio Enabled',
					description: 'Enable or disable all bridge sounds',
				},
			},
			actions: {
				name: 'Actions',
			},
			editor: {
				jsonEditor: {
					name: 'JSON Editor',
					description: 'Choose how you want to edit JSON files',
				},
				wordWrap: {
					name: 'Word Wrap',
					description: 'Wrap words to disable horizontal scrolling',
				},
				compactTabDesign: {
					name: 'Compact Tab Design',
					description:
						'Display tabs inside of the tab system in a more compact way',
				},
			},
		},
		projectFolder: {
			title: 'Project Folder',
			content:
				'bridge. needs access to its project folder in order to work correctly.',
		},
		extensionStore: {
			title: 'Extension Store',
			searchExtensions: 'Search extension...',
			activateExtension: 'Activate Extension',
			deactivateExtension: 'Deactivate Extension',
			offlineError:
				'Failed to load extensions. Please confirm that your device has an active network connection.',
		},
		pluginInstallLocation: {
			title: 'Choose Install Location',
		},
		unsavedFile: {
			description:
				'Do you want to save your changes to this file before closing it?',
			save: 'Save & Close',
		},
		browserUnsupported: {
			title: 'Unsupported Browser',
			description:
				'Please use Chrome (Desktop) or Edge (Chromium) in order to get the best experience using bridge. v2! Your browser does not support saving files directly and syncing projects to your com.mojang folder.',
			continue: 'Continue Anyways',
		},
		invalidJson: {
			title: 'Invalid JSON',
			description:
				'bridge.\'s tree editor cannot open files that contain invalid JSON. You can switch to the "Raw Text" editor type inside of the settings to manually fix the issue.',
		},
		loadingWindow: {
			titles: {
				loading: 'Loading...',
			},
		},
	},
	taskManager: {
		tasks: {
			packIndexing: {
				title: 'Indexing Packs',
				description:
					'bridge. is collecting data about your pack that is needed for its intelligent features',
			},
			compiler: {
				title: 'Compiling Project',
				description:
					'bridge. is compiling your project to make it ready for import into Minecraft',
			},
			unzipper: {
				name: 'Unpacking ZIP',
				description: 'bridge. is currently unpacking a ZIP file.',
			},
			loadingSchemas: {
				name: 'Loading Auto-Completions',
				description:
					'bridge. is currently loading its auto-completion data.',
			},
		},
	},
	fileDropper: {
		importFiles: 'Drop files here to import them!',
		importFailed: 'bridge. was unable to import the following files:',
		andMore: '...and more!',
		importMethod: 'Import Method',
		saveToProject: {
			title: 'Save to Project',
			description1: 'Save the file ',
			description2: ' inside of your project.',
		},
		openFile: {
			title: 'Open File',
			description1: 'Open the file ',
			description2: ' and save edits to the original file.',
		},
	},
	comMojang: {
		folderDropped:
			'Do you want to set this folder as your default com.mojang folder?',
		title: 'Access to folder "com.mojang"',
		permissionRequest:
			'bridge. needs access to your "com.mojang" folder in order to compile projects to it.',
		status: {
			sucess: 'Syncing your projects to com.mojang is setup correctly.',
			deniedPermission:
				'You setup com.mojang syncing but you did not grant bridge. permission to the folder.',
			notSetup: 'You have not setup com.mojang syncing yet.',
			notAvailable:
				'Syncing projects to the com.mojang folder is only available for Chrome and Edge users.',
		},
	},
	findAndReplace: {
		name: 'Find & Replace',
		search: 'Search',
		replace: 'Replace',
		replaceAll: 'Replace All',
		noResults: 'No results found.',
		noSearch:
			'Once you start typing, results for your search query will appear here.',
	},
	preview: {
		name: 'Preview',
		viewAnimation: 'View Animation',
		viewModel: 'View Model',
		viewParticle: 'View Particle',
		viewEntity: 'View Entity',
		viewBlock: 'View Block',
		failedClientEntityLoad: 'Failed to load connected client entity',
		invalidEntity:
			'Cannot open preview for an entity with invalid JSON. Please fix JSON errors inside of the file and try again.',
		chooseGeometry: 'Choose Geometry',
		noGeometry:
			'No valid geometry found inside of this file. Make sure that your JSON is valid, that the file structure is correct and that a geometry with the provided identifier exists.',
	},
	initialSetup: {
		welcome: 'Welcome to bridge. v2!',
		welcomeCaption: 'A powerful IDE for Minecraft Add-Ons',
		step: {
			installApp: {
				name: 'Install bridge.',
				description:
					'For the best experience, install bridge. v2 as an app to your computer.',
			},
			bridge: {
				name: 'bridge. Folder',
				description:
					'Please create a folder where bridge. can save app related data and your add-on projects.',
			},
			bridgeProject: {
				name: 'bridge. Project',
				description:
					'Do you want to create a new project or import an existing project from a .brproject file?',
				createNew: {
					name: 'New Project',
					description: 'Create a new project.',
				},
				importExisting: {
					name: 'Import Project',
					description: 'Import an existing project.',
				},
			},
			comMojang: {
				name: 'com.mojang Folder',
				description:
					'Now drag your com.mojang folder onto bridge. to setup syncing of projects to this folder. This makes your add-ons accessible inside of Minecraft for Windows 10 automatically. Setting up com.mojang syncing can be done at any point in time while bridge. is open.',
				extraDescription: 'Drag your com.mojang folder onto bridge.',
			},
			editorType: {
				name: 'Choose Editor Type',
				description:
					"How do you want to edit JSON files? You can change your choice inside of bridge.'s settings later!",
				rawText: {
					name: 'Raw Text',
					description:
						'Edit JSON as raw text. Ideal for intermediate to advanced developers. Comes with advanced auto-completions and JSON validation.',
				},
				treeEditor: {
					name: 'Tree Editor',
					description:
						'Edit JSON as a tree-like structure that requires little to no JSON knowledge. Ideal for beginners and intermediate creators.',
				},
			},
		},
	},
	editors: {
		treeEditor: {
			addObject: 'Add Object',
			addArray: 'Add Array',
			addValue: 'Add Value',
			edit: 'Edit',
		},
	},
}

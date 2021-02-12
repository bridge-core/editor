import { en } from 'vuetify/src/locale'

export default {
	...en,
	languageName: 'English',
	// File Type display names
	fileType: {
		manifest: 'Manifest',
		animation: 'Animation',
		animationController: 'Animation Controller',
		biome: 'Biome',
		block: 'Block',
		entity: 'Entity',
		feature: 'Feature',
		featureRule: 'Feature Rule',
		functionTick: 'Function Tick',
		function: 'Function',
		item: 'Item',
		lootTable: 'Loot Table',
		recipe: 'Recipe',
		script: 'Script',
		spawnRule: 'Spawn Rule',
		mcstructure: 'Structure',
		tradeTable: 'Trade Table',
		clientManifest: 'Client Manifest',
		geometry: 'Geometry',
		clientAnimation: 'Client Animation',
		clientAnimationController: 'Client Animation Controller',
		attachable: 'Attachable',
		clientEntity: 'Client Entity',
		clientItem: 'Client Item',
		fog: 'Fog',
		particle: 'Particle',
		renderController: 'Render Controller',
		textureSet: 'Texture Set',
		itemTexture: 'Item Texture',
		clientBlock: 'Client Block',
		terrainTexture: 'Terrain Texture',
		flipbookTexture: 'Flipbook Texture',
		clientBiome: 'Client Biome',
		soundDefinition: 'Sound Definition',
		clientSound: 'Client Sound',
		skins: 'Skins',
		langDef: 'Language Definitions',
		lang: 'Language',
		molang: 'Molang',
		unknown: 'Other',
		simpleFile: 'Simple Files',
	},
	// Actions
	actions: {
		newFile: {
			name: 'New File',
			description: 'Create a new Add-On feature',
		},
		openFile: {
			name: 'Open File',
			description: 'Search and open a file from the current project',
		},
		saveFile: {
			name: 'Save File',
			description: 'Save the currently opened file',
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
			description: 'Manage your installed extensions',
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
		pluginAPI: {
			name: 'Plugin API',
			description: "Read more about bridge.'s plugin API",
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
		},
		extensions: {
			name: 'Extensions',
			intro: {
				description: 'Customize Your bridge. Experience With Plugins!',
				themes: 'Themes',
				snippets: 'Snippets',
				presets: 'Presets',
				uiElements: 'UI Elements',
				andMore: 'And Much More!',
				viewExtensions: 'View Extensions',
			},
		},
		notifications: {
			discord: {
				message: 'Discord Server',
			},
			gettingStarted: {
				message: 'Getting Started',
			},
			installApp: {
				name: 'Install app',
			},
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
	// Windows
	windows: {
		common: {
			confirm: {
				title: 'Confirm',
			},
			dropdown: {
				confirm: 'Confirm',
			},
			information: {
				confirm: 'Okay',
			},
			input: {
				confirm: 'Confirm',
			},
		},
		loadingWindow: {
			title: 'Loading...',
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
			title: 'Create Project',
			packIcon: 'Project Icon (optional)',
			projectName: 'Project Name',
			projectDescription: 'Project Description (optional)',
			projectPrefix: 'Project Prefix',
			projectAuthor: 'Project Author',
			projectTargetVersion: 'Project Target Version',
			create: 'Create!',
		},
		createPreset: {
			title: 'Create Preset',
			searchPresets: 'Search presets...',
		},
		deleteProject: {
			confirm: 'Delete',
			cancel: 'Cancel',
			description: 'Are you sure you want to delete this project?',
		},
		discord: {
			title: 'Discord',
			content: 'Join the official bridge. Discord server!',
			join: 'Join',
			later: 'Later',
		},
		projectChooser: {
			title: 'Projects',
			searchProjects: 'Search projects...',
		},
		selectFolder: {
			title: 'Select Folder',
			content:
				'Select where to save projects or choose an existing projects directory.',
			select: 'Select!',
		},
		packExplorer: {
			title: 'Pack Explorer',
			searchFiles: 'Search files...',
			categories: 'Categories',
		},
		settings: {
			title: 'Settings',
			searchSettings: 'Search settings...',
		},
		projectFolder: {
			title: 'Project Folder',
			content:
				'bridge. needs access to its project folder in order to work correctly.',
		},
		extensionStore: {
			title: 'Extension Store',
			searchExtensions: 'Search extension...',
		},
		pluginInstallLocation: {
			title: 'Choose Install Location',
		},
		unsavedFile: {
			title: 'Confirm',
			description:
				'Do you want to save your changes to this file before closing it?',
			cancel: 'Cancel',
			noSave: 'Close',
			save: 'Save & Close',
		},
		browserUnsupported: {
			title: 'Unsupported Browser',
			description:
				'Your browser is currently not supported. Please use Chrome or Edge (Chromium) in order to get started with bridge.!',
		},
	},
	taskManager: {
		tasks: {
			packIndexing: {
				title: 'Indexing Packs',
				description:
					'bridge. is collecting data about your pack that is needed for its intelligent features.',
			},
			compiler: {
				title: 'Compiling Project',
				description:
					'bridge. is compiling your project to make it ready for import into Minecraft.',
			},
		},
	},
}

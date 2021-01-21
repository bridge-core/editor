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
	},
	// Toolbar Categories
	toolbar: {
		installApp: 'Install app',
		file: {
			name: 'File',
			newFile: 'New File',
			import: {
				name: 'Import',
				openFile: 'Open File',
				importOBJ: 'Import OBJ Model',
			},
			saveFile: 'Save File',
			saveAs: 'Save As',
			saveAll: 'Save All',
			closeEditor: 'Close Editor',
			clearAllNotifications: 'Clear all notifications',
			preferences: {
				name: 'Preferences',
				settings: 'Settings',
				extensions: 'Extensions',
			},
		},
		edit: {
			name: 'Edit',
			selection: {
				name: 'Selection',
				unselect: 'Unselect',
				selectParent: 'Select Parent',
				selectNext: 'Select Next',
				selectPrevious: 'Select Previous',
			},
			jsonNodes: {
				name: 'JSON Nodes',
				toggleOpen: 'Toggle Open',
				toggleOpenChildren: 'Toggle Open Children',
				moveDown: 'Move Down',
				moveUp: 'Move Up',
				commentUncomment: 'Comment/Uncomment',
			},
			delete: 'Delete',
			undo: 'Undo',
			redo: 'Redo',
			copy: 'Copy',
			cut: 'Cut',
			paste: 'Paste',
			alternativePaste: 'Alternative Paste',
		},
		tools: {
			name: 'Tools',
			docs: 'Documentation',
			terminal: 'Terminal',
			presets: 'Presets',
			snippets: 'Snippets',
			goToFile: 'Go to File',
		},
		help: {
			name: 'Help',
			about: 'About',
			releases: 'Releases',
			bugReports: 'Bug Reports',
			pluginAPI: 'Plugin API',
			gettingStarted: 'Getting Started',
			faq: 'FAQ',
		},
		dev: {
			name: 'Development',
			reloadBrowserWindow: 'Reload Browser Window',
			reloadEditorData: 'Reload Editor Data',
			developerTools: 'Developer Tools',
		},
	},
	// Sidebar tabs
	sidebar: {
		vanillaPacks: {
			name: 'Vanilla Packs',
		},
		debugLog: {
			name: 'Debug Log',
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
	},
	// Welcome Screen
	welcome: {
		title: 'Welcome To bridge.',
		subtitle: 'Creating Minecraft addons has never been more convenient!',
		syntaxHighlighting: 'Syntax Highlighting',
		richAutoCompletions: 'Rich auto-completions',
		projectManagement: 'Easy project management',
		customSyntax: 'Custom addon syntax',
		customComponents: 'Custom components',
		customCommands: 'Custom commands',
		plugins: 'Customizable through plugins',
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
		},
		createProject: {
			title: 'Create Project',
			packIcon: 'Project Icon (optional)',
			projectName: 'Project Name',
			create: 'Create!',
		},
		createPreset: {
			title: 'Create Preset',
			searchPresets: 'Search presets...',
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
		taskManager: {
			title: 'Task Manager',

			tasks: {
				packIndexing: {
					title: 'Indexing Packs',
					description:
						'bridge. is collecting data about your pack that is needed for its intelligent features.',
				},
			},
		},
		projectFolder: {
			title: 'Project Folder',
			content:
				'bridge. needs access to its project folder in order to work correctly.',
		},
		managePlugin: {
			name: 'Manage Plugin',
			done: 'Done',
		},
		projectSharing: {
			title: 'Project Sharing',
		},
		peerError: {
			error1: 'Unable to connect to workspace with id',
			error2: 'Unable to connect to workspace!',
		},
	},
}

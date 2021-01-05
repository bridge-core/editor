import { nl } from 'vuetify/src/locale'

export default {
	...nl,
	languageName: 'Nederlands',
	// Toolbar Categories
	toolbar: {
		installApp: 'Install app',
		file: {
			name: 'Bestand',
			newFile: 'Nieuw Bestand',
			import: {
				name: 'Importeer',
				openFile: 'Open Bestand',
				importOBJ: 'Importeer OBJ Model',
			},
			saveFile: 'Bestand Opslaan',
			saveAs: 'Opslaan als',
			saveAll: 'Alles Opslaan',
			closeEditor: 'Sluit Editor',
			clearAllNotifications: 'Wis alle meldingen',
			preferences: {
				name: 'Voorkeuren',
				settings: 'Instellingen',
				extensions: 'Extensies',
			},
		},
		edit: {
			name: 'Bewerk',
			selection: {
				name: 'Selectie',
				unselect: 'Selectie ongedaan maken',
				selectParent: 'Selecteer bovenstaande',
				selectNext: 'Selecteer Volgende',
				selectPrevious: 'Selecteer Vorige',
			},
			jsonNodes: {
				name: 'JSON Nodes',
				toggleOpen: 'Open/Sluit',
				toggleOpenChildren: 'Open/Sluit Object',
				moveDown: 'Verplaats Omhoog',
				moveUp: 'Verplaats Omlaag',
				commentUncomment: 'Activeren/Deactiveren',
			},
			delete: 'Verwijderen',
			undo: 'Ongedaan maken',
			redo: 'Opnieuw gedaan maken',
			copy: 'Kopiëren',
			cut: 'Knippen',
			paste: 'Plakken',
			alternativePaste: 'Alternatief Plakken',
		},
		tools: {
			name: 'Hulpmiddelen',
			docs: 'Documentatie',
			presets: 'Voorinstellingen',
			snippets: 'Fragmenten',
			goToFile: 'Ga naar Bestand',
		},
		help: {
			name: 'Help',
			about: 'Over',
			releases: 'Software Versies',
			bugReports: 'Bug meldingen',
			pluginAPI: 'Plugin API',
			gettingStarted: 'Aan de slag',
			faq: 'FAQ',
		},
		dev: {
			name: 'Ontwikkeling',
			reloadBrowserWindow: 'Herlaad het browservenster',
			reloadEditorData: 'Herlaad Editor Gegevens',
			developerTools: 'Ontwikkelaar Tools',
		},
	},
	// Sidebar tabs
	sidebar: {
		explorer: {
			name: 'Verkenner',
		},
		vanillaPacks: {
			name: 'Vanilla Pakketten',
		},
		debugLog: {
			name: 'Foutopsporingslogboek',
		},
		extensions: {
			name: 'Extensies',
			intro: {
				description: 'Pas uw bridge. ervaring aan met Plugins!',
				themes: "Thema's",
				snippets: 'Fragmenten',
				presets: 'Voorinstellingen',
				uiElements: 'UI Elementen',
				andMore: 'En nog veel meer!',
				viewExtensions: 'Bekijk extensies',
			},
		},
	},
	// Welcome Screen
	welcome: {
		title: 'Welkom bij bridge.',
		subtitle:
			'Het maken van Minecraft addons is nog nooit zo gemakkelijk geweest!',
		syntaxHighlighting: 'Syntaxis accentuering',
		richAutoCompletions: 'Uitgebreide automatische aanvullingen',
		projectManagement: 'Eenvoudig projectbeheer',
		customSyntax: 'Aangepaste syntaxis voor add-ons',
		customComponents: 'Aangepaste componenten',
		customCommands: "Aangepaste commando's",
		plugins: 'Aanpasbaar via plugins',
	},
	// Windows
	windows: {
		common: {
			confirm: {
				title: 'Bevestigen',
			},
			dropdown: {
				confirm: 'Bevestigen',
			},
			information: {
				confirm: 'Oke',
			},
			input: {
				confirm: 'Bevestigen',
			},
		},
		discord: {
			content: 'Sluit je aan bij de officiële bridge. Discord server!',
			join: 'Aansluiten',
			later: 'Later',
		},
		selectFolder: {
			title: 'Selecteer Map',
			content:
				'Selecteer waar u projecten wilt opslaan of kies een bestaande projectenmap.',
			select: 'Selecteer!',
		},
		projectFolder: {
			title: 'Project Map',
			content:
				'bridge. heeft toegang tot zijn projectmap nodig om correct te werken.',
		},
	},
}

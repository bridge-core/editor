import { de } from 'vuetify/src/locale'

export default {
	...de,
	languageName: 'Deutsch',
	// Toolbar Categories
	toolbar: {
		file: {
			name: 'Datei',
			newFile: 'Neue Datei',
			import: {
				name: 'Import',
				openFile: 'Datei öffnen',
				importOBJ: 'OBJ Model importieren',
			},
			saveFile: 'Datei speichern',
			saveAs: 'Datei speichern als...',
			saveAll: 'Alle Dateien speichern',
			closeEditor: 'Editor schließen',
			clearAllNotifications: 'Alle Nachrichten löschen',
			preferences: {
				name: 'Präferenzen',
				settings: 'Einstellungen',
				extensions: 'Erweiterungen',
			},
		},
		edit: {
			name: 'Editieren',
			selection: {
				name: 'Auswahl',
				unselect: 'Auswahl aufheben',
				selectParent: 'Auswahl hoch',
				selectNext: 'Nächste Auswahl',
				selectPrevious: 'Vorherige Auswahl',
			},
			jsonNodes: {
				name: 'JSON Nodes',
				toggleOpen: 'Öffnen/Schließen',
				toggleOpenChildren: 'Kinder öffnen/schließen',
				moveDown: 'Bewegen: Nach Oben',
				moveUp: 'Bewegen: nach Unten',
				commentUncomment: 'Aktivieren/Deaktivieren',
			},
			delete: 'Löschen',
			undo: 'Undo',
			redo: 'Redo',
			copy: 'Kopieren',
			cut: 'Auschneiden',
			paste: 'Einfügen',
			alternativePaste: 'Kopieren (alternativ)',
		},
		tools: {
			name: 'Werkzeuge',
			presets: 'Dateibündel',
			snippets: 'Codeschnipsel',
			goToFile: 'Gehe zu Datei...',
		},
		help: {
			name: 'Hilfe',
			about: 'Über bridge.',
			releases: 'Updates',
			bugReports: 'Fehler melden',
			pluginAPI: 'Erweiterungs API',
			gettingStarted: 'Wie du loslegst...',
			faq: 'FAQ',
		},
		dev: {
			name: 'Entwicklung',
			reloadBrowserWindow: 'App neu laden',
			reloadEditorData: 'Editor Daten neu laden',
			developerTools: 'Entwicklerwerkzeuge',
		},
	},
	// Sidebar tabs
	sidebar: {
		explorer: {
			name: 'Dateien',
		},
		vanillaPacks: {
			name: 'Vanilla Pakete',
		},
		documentation: {
			name: 'Dokumentation',
		},
		debugLog: {
			name: 'Debug Log',
		},
		extensions: {
			name: 'Erweiterungen',
			intro: {
				description: 'Ändere deine bridge. Erfahrung mit Plugins!',
				themes: 'Farbmotive',
				snippets: 'Codeschnipsel',
				presets: 'Dateibündel',
				uiElements: 'Neue UIs',
				andMore: 'Und vieles mehr!',
				viewExtensions: 'Erweiterungen!',
			},
		},
	},
	// Welcome Screen
	welcome: {
		title: 'Willkomen zu bridge.',
		subtitle: 'Die Minecraft Add-On Entwicklung war niemals einfacher!',
		syntaxHighlighting: 'Syntax Farbhervorhebung',
		richAutoCompletions: 'Intelligente Autovervollständigung',
		projectManagement: 'Einfaches Projektmanagement',
		customSyntax: 'Neue Add-On Features',
		customComponents: 'Erstelle neue Komponenten',
		customCommands: 'Erstelle neue Kommandos',
		plugins: 'Erweiterbar mit Plugins!',
	},
	// Windows
	windows: {
		common: {
			confirm: {
				title: 'Bestätigen',
			},
			dropdown: {
				confirm: 'Bestätigen',
			},
			information: {
				confirm: 'Okay',
			},
			input: {
				confirm: 'Bestätigen',
			},
		},
		discord: {
			content: 'Trete dem offiziellen bridge. Discord bei!',
			join: 'Beitreten',
			later: 'Später',
		},
		selectFolder: {
			title: 'Ordner auswählen',
			content:
				'Erstelle einen neuen Ordner, indem wir Projekte speichern sollen oder wähle einen existierenden Projekte-Ordner.',
			select: 'Auswählen!',
		},
	},
}

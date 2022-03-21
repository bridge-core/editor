import { de } from 'vuetify/locale'

export default {
	...de,
	languageName: 'Deutsch',
	packType: {
		behaviorPack: {
			name: 'Verhaltenspaket',
			description:
				'Erstelle neue Spielmechaniken und ändere, wie sich Minecraft verhält',
		},
		resourcePack: {
			name: 'Ressourcenpaket',
			description: "Verändere Minecraft's Aussehen und Sound",
		},
		skinPack: {
			name: 'Charakterpaket',
			description:
				'Erstelle verschieden Charakter, die ein Spieler auswählen kann',
		},
		worldTemplate: {
			name: 'Weltvorlage',
			description: 'Gebe Spielern eine Welt zum Erkunden',
		},
	},
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
		musicDefinition: 'Music Definition',
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
		newProject: {
			name: 'Neues Projekt',
			description: 'Erstelle ein neues Projekt',
		},
		newFile: {
			name: 'Neue Datei',
			description: 'Erstelle ein neues Add-On Feature',
		},
		openFile: {
			name: 'Öffne Datei',
			description:
				'Suche und öffne eine Datei deines momentanen Projektes',
		},
		saveFile: {
			name: 'Speichere Datei',
			description: 'Speichere die aktuelle Datei',
		},
		closeFile: {
			name: 'Schließe Datei',
			description: 'Schließe die aktuelle Datei',
		},
		settings: {
			name: 'Einstellungen',
			description: "Öffne bridge.'s Appeinstellungen",
		},
		extensions: {
			name: 'Erweiterungen',
			description: 'Installiere und verwalte Erweiterungen',
		},
		copy: {
			name: 'Kopieren',
			description: 'Kopiere ausgewählten Text',
		},
		cut: {
			name: 'Schneiden',
			description:
				'Kopiere ausgewählten Text und entferne ihn aus dem ursprünglichen Kontext',
		},
		paste: {
			name: 'Einfügen',
			description: 'Füge kopierten Text ein',
		},
		docs: {
			name: 'Dokumentation',
			description: 'Öffne die Minecraft Add-On Dokumentation',
		},
		releases: {
			name: 'Updates',
			description: 'Sehe die neusten Updates',
		},
		bugReports: {
			name: 'Fehler Melden',
			description: 'Melde einen Fehler der App',
		},
		pluginAPI: {
			name: 'Erweiterungs API',
			description: "Lese mehr über bridge.'s Erweiterungs API",
		},
		gettingStarted: {
			name: "So Geht's Los!",
			description: 'Lies unser Tutorial, wie du mit bridge. loslegst.',
		},
		faq: {
			name: 'FAQ',
			description: 'Informiere dich über häufig gestellte Fragen',
		},
		reloadAutoCompletions: {
			name: 'Autovervollständigung Neuladen',
			description: 'Lade alle Autovervollständigungen neu',
		},
		pluginInstallLocation: {
			global: {
				name: 'Global Installieren',
				description:
					'Globale Erweiterungen sind in allen Projekten aktiv',
			},
			local: {
				name: 'Lokal Installieren',
				description:
					'Lokale Erweiterungen sind in deinem aktuellen Projekt aktiv',
			},
		},
	},
	// Toolbar Categories
	toolbar: {
		file: {
			name: 'Datei',
			preferences: {
				name: 'Präferenzen',
			},
		},
		edit: {
			name: 'Editieren',
		},
		tools: {
			name: 'Werkzeuge',
		},
		help: {
			name: 'Hilfe',
		},
	},
	// Sidebar tabs
	sidebar: {
		compiler: {
			name: 'Compiler',
		},
		extensions: {
			name: 'Erweiterungen',
		},
		notifications: {
			discord: {
				message: 'Discord Server',
			},
			gettingStarted: {
				message: "So Geht's los!",
			},
			installApp: {
				message: 'App Installieren',
			},
			updateAvailable: {
				message: 'Update Verfügbar',
			},
		},
	},
	// Welcome Screen
	welcome: {
		title: 'Willkommen zu bridge.',
		subtitle: 'Add-On Entwicklung einfach gemacht!',
		quickActions: 'Aktionen',
		recentFiles: 'Zuletzt Verwendet',
		recentProjects: 'Letzte Projekte',
	},
	// Windows
	windows: {
		common: {
			confirm: {
				title: 'Bestätigung',
			},
			dropdown: {
				confirm: 'Bestätigung',
			},
			information: {
				confirm: 'Okay',
			},
			input: {
				confirm: 'Bestätigung',
			},
		},
		loadingWindow: {
			title: 'Laden...',
		},
		openFile: {
			title: 'Öffnen',
			search: 'Datei suchen...',
			noData: 'Keine Ergebnisse...',
		},
		createProject: {
			welcome: 'Willkommen to bridge.!',
			welcomeDescription: 'Erstelle dein erstes Projekt, um loszulegen.',
			omitPack: 'Nicht Ausgewählt',
			selectedPack: 'Ausgewählt',
			title: 'Projekt Erstellen',
			packIcon: 'Projekt Logo (optional)',
			projectName: 'Projekt Name',
			projectDescription: 'Projekt Beschreibung (optional)',
			projectPrefix: 'Project Präfix',
			projectAuthor: 'Project Author',
			projectTargetVersion: 'Projekt Zielversion',
			create: 'Erstellen!',
		},
		createPreset: {
			title: 'Erstelle Preset',
			searchPresets: 'Suche Presets...',
		},
		deleteProject: {
			confirm: 'Löschen',
			cancel: 'Abbrechen',
			description:
				'Bist du sicher, dass du das Projekt entfernen willst?',
		},
		discord: {
			title: 'Discord',
			content: 'Trete dem offizielen bridge. Discord Server bei!',
			join: 'Beitreten',
			later: 'Später',
		},
		projectChooser: {
			title: 'Projekte',
			searchProjects: 'Suche Projekte...',
		},
		selectFolder: {
			title: 'Ordner Aussuchen',
			content:
				'Wähle einen Ordner, indem bridge. deinen Projekte speichern soll.',
			select: 'Auswählen!',
		},
		packExplorer: {
			title: 'Paket Explorer',
			searchFiles: 'Suche Dateien...',
			categories: 'Kategorien',
		},
		settings: {
			title: 'Einstellungen',
			searchSettings: 'Suche Einstellungen...',
			appearance: {
				name: 'Aussehen',
				colorScheme: {
					name: 'Farbschema',
					description:
						"Wähle ein Farbschema für bridge.'s Benutzeroberfläche",
				},
				darkTheme: {
					name: 'Dunkles Theme',
					description: 'Select the default dark theme bridge. uses',
				},
				lightTheme: {
					name: 'Helles Theme',
					description: 'Select the default light theme bridge. uses',
				},
				localDarkTheme: {
					name: 'Lokales Dunkles Theme',
					description:
						'Choose a dark theme for the currently active project',
				},
				localLightTheme: {
					name: 'Lokales Helles Theme',
					description:
						'Choose a light theme for the currently active project',
				},
				sidebarRight: {
					name: 'Rechte Seitenleiste',
					description:
						'Bewege die Seitenleiste auf die rechte Seite des Screens',
				},
				shrinkSidebarElements: {
					name: 'Kleine Seitenleistenelemente',
					description:
						'Schrumpfe die Seitenleistenelemente, sodass sie weniger Platz benötigen',
				},
			},
			general: {
				name: 'Allgemein',
				language: {
					name: 'Sprache',
					description: 'Wähle eine Sprache für bridge. aus',
				},
				collaborativeMode: {
					name: 'Kollaborativer Modus',
					description:
						'Lädt den Cache komplett neu, wenn du die Projekte wechselst. Kann deaktiviert werden, wenn du alleine arbeitest und du nur bridge. für dein Projekt nutzt',
				},
				packSpider: {
					name: 'Pack Spider',
					description:
						'Pack Spider erkennt Verbindungen zwischen Dateien deines Projektes und bildet diese in einem Virtuellen Dateiensystem ab',
				},
				openLinksInBrowser: {
					name: 'Öffne Links im Browser',
					description:
						'Öffne Links in deinem Browser anstelle von Applikationsfenstern',
				},
				resetBridgeFolder: {
					name: 'Wähle bridge. Ordner',
					description:
						'Wähle dein Hautpordner, auf dem bridge. arbeitet',
				},
			},
			developer: {
				name: 'Entwickler',
				simulateOS: {
					name: 'OS Simulieren',
					description:
						'Simuliere ein anderes OS, um platformspezifische Features zu testen',
				},
				devMode: {
					name: 'Developermodus',
					description: 'Aktiviere den Developermodus für diese App',
				},
			},
			actions: {
				name: 'Aktionen',
			},
		},
		projectFolder: {
			title: 'Projekte Ordner',
			content: 'bridge. benötigt Zugriff auf deinen Projekteordner.',
		},
		extensionStore: {
			title: 'Erweiterungen',
			searchExtensions: 'Suche Erweiterungen...',
		},
		pluginInstallLocation: {
			title: 'Wähle Installationsart',
		},
		unsavedFile: {
			title: 'Bestätigen',
			description:
				'Möchtest du die Änderungen an dieser Datei speichern?',
			cancel: 'Abbrechen',
			noSave: 'Schließen',
			save: 'Spichern & Schließen',
		},
		browserUnsupported: {
			title: 'Keine Browserunterstützung!',
			description:
				'bridge. unterstützt deinen Browser momentan nicht. Bitte nutze Chrome (Desktop) or Edge (Chromium), um bridge. zu nutzen!',
		},
	},
	taskManager: {
		tasks: {
			packIndexing: {
				title: 'Paketindizierung',
				description:
					'bridge. sammelt Daten aus deinem Paket, die es für seine intelligenten Features benötigt',
			},
			compiler: {
				title: 'Projektkompilierung',
				description:
					'bridge. kompiliert dein Projekt, um es für die Nutzung in Minecraft vorzubereiten',
			},
		},
	},
}

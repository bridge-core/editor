import { nl } from 'vuetify/src/locale'

export default {
	...nl,
	languageName: 'Nederlands',
	packType: {
		behaviorPack: {
			name: 'Gedragspakket',
			description:
				'Creëer nieuwe spelmechanismen en verander hoe Minecraft zich gedraagt',
		},
		resourcePack: {
			name: 'Resourcepakket',
			description: "Wordt gebruikt voor het veranderen van Minecraft's uiterlijk en geluid",
		},
		skinPack: {
			name: 'Skin Pakket',
			description:
				'Voorziet nieuwe uiterlijken die de speler kan selecteren voor hun karakter',
		},
		worldTemplate: {
			name: 'Wereldsjabloon',
			description: 'Geef spelers een wereld om te verkennen',
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
			name: 'Nieuw Project',
			description: 'Maak een nieuw bridge. project',
		},
		newFile: {
			name: 'Nieuw Bestand',
			description: 'Maak een nieuwe Add-On functie',
		},
		openFile: {
			name: 'Open Bestand',
			description: 'Zoek en open een bestand in het huidige project',
		},
		saveFile: {
			name: 'Bestand Opslaan',
			description: 'Sla het momenteel geopende bestand op',
		},
		closeFile: {
			name: 'Bestand Sluiten',
			description: 'Sluit het momenteel geopende bestand',
		},
		settings: {
			name: 'Instellingen',
			description: "Open de app instellingen van bridge.",
		},
		extensions: {
			name: 'Extensies',
			description: 'Beheer uw geïnstalleerde extensies',
		},
		copy: {
			name: 'Kopiëren',
			description: 'Kopieer geselecteerde tekst naar het klembord',
		},
		cut: {
			name: 'Knippen',
			description:
				'Kopieer geselecteerde tekst naar het klembord en verwijder deze uit de oorspronkelijke context',
		},
		paste: {
			name: 'Plakken',
			description: 'Plak de inhoud van het klembord',
		},
		docs: {
			name: 'Documentatie',
			description: 'Opent de Minecraft Add-On documentatie',
		},
		releases: {
			name: 'Releases',
			description: 'Bekijk de nieuwste bridge. releases',
		},
		bugReports: {
			name: 'Foutmeldingen',
			description: 'Meld een probleem met bridge.',
		},
		pluginAPI: {
			name: 'Plugin API',
			description: "Lees meer over de plugin API van bridge",
		},
		gettingStarted: {
			name: 'Beginnen',
			description: 'Lees onze gids om aan de slag te gaan met bridge.',
		},
		faq: {
			name: 'FAQ',
			description:
				'Lees veelgestelde vragen over het ontwikkelen van Add-Ons met bridge.',
		},
		reloadAutoCompletions: {
			name: 'Herlaad automatische aanvullingen',
			description: 'Herlaadt alle gegevens voor automatisch aanvullen opnieuw',
		},
		closeTab: {
			name: 'Sluit Tab',
			description: 'Sluit dit tabblad',
		},
		closeAll: {
			name: 'Sluit Alles',
			description: 'Sluit alle tabbladen',
		},
		closeTabsToRight: {
			name: 'Sluit tabbladen aan de rechterkant',
			description: 'Sluit alle tabbladen aan de rechterkant van dit tabblad',
		},
		closeAllSaved: {
			name: 'Sluit alle opgeslagen',
			description: 'Sluit alle opgeslagen tabbladen',
		},
		closeOtherTabs: {
			name: 'Sluit andere tabbladen',
			description: 'Sluit alle tabbladen behalve dit tabblad',
		},
		pluginInstallLocation: {
			global: {
				name: 'Globaal Installeren',
				description:
					'Globale extensies zijn toegankelijk in al uw projecten',
			},
			local: {
				name: 'Locaal Installeren',
				description:
					'Lokale extensies zijn alleen toegankelijk binnen de projecten waaraan u ze toevoegt',
			},
		},
	},
	// Toolbar Categories
	toolbar: {
		file: {
			name: 'Bestand',
			preferences: {
				name: 'Voorkeuren',
			},
		},
		edit: {
			name: 'Bewerk',
		},
		tools: {
			name: 'Hulpmiddelen',
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
			name: 'Extensies',
		},
		notifications: {
			discord: {
				message: 'Discord Server',
			},
			gettingStarted: {
				message: 'Beginnen',
			},
			installApp: {
				message: 'Installeer App',
			},
			updateAvailable: {
				message: 'Update Beschikbaar',
			},
		},
	},
	// Welcome Screen
	welcome: {
		title: 'Welkom bij bridge.',
		subtitle: 'Het maken van Minecraft addons is nog nooit zo gemakkelijk geweest!',
		quickActions: 'Snelle Acties',
		recentFiles: 'Recente Bestanden',
		recentProjects: 'Recente Projecten',
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
		loadingWindow: {
			title: 'Laden...',
		},
		openFile: {
			title: 'Openen',
			search: 'Zoek bestand...',
			noData: 'Geen resultaten...',
		},
		createProject: {
			welcome: 'Welkom bij bridge.!',
			welcomeDescription:
				'Maak alstublieft uw eerste project aan om aan de slag te gaan.',
			omitPack: 'Weglaten',
			selectedPack: 'Geselecteerd',
			title: 'Project Maken',
			packIcon: 'Projectpictogram (optioneel)',
			projectName: 'Projectnaam',
			projectDescription: 'Projectbeschrijving (optioneel)',
			projectPrefix: 'Projectvoorvoegsel',
			projectAuthor: 'Project Auteur',
			projectTargetVersion: 'Doelversie van het project',
			create: 'Creëer!',
		},
		createPreset: {
			title: 'Voorinstelling maken',
			searchPresets: 'Voorinstellingen zoeken...',
		},
		deleteProject: {
			confirm: 'Verwijderen',
			cancel: 'Annuleren',
			description: 'Weet u zeker dat u dit project wilt verwijderen?',
		},
		discord: {
			title: 'Discord',
			content: 'Sluit je aan bij de officiële bridge. Discord server!',
			join: 'Aansluiten',
			later: 'Later',
		},
		projectChooser: {
			title: 'Projecten',
			searchProjects: 'Zoek Projecten...',
		},
		selectFolder: {
			title: 'Selecteer Map',
			content:
				'Selecteer waar u projecten wilt opslaan of kies een bestaande projectenmap.',
			select: 'Selecteer!',
		},
		packExplorer: {
			title: 'Pack Explorer',
			searchFiles: 'Zoek bestanden...',
			categories: 'Categorieën',
		},
		settings: {
			title: 'Instellingen',
			searchSettings: 'Zoek instellingen...',
			appearance: {
				name: 'Uiterlijk',
				colorScheme: {
					name: 'Kleurenschema',
					description: "Kies het kleurenschema voor de gebruikersinterface van bridge.",
				},
				darkTheme: {
					name: 'Donker Thema',
					description: 'Selecteer het standaard donkere thema dat door bridge. wordt gebruikt',
				},
				lightTheme: {
					name: 'Licht Thema',
					description: 'Selecteer het standaard lichte thema dat door bridge. wordt gebruikt',
				},
				localDarkTheme: {
					name: 'Lokaal Donker Thema',
					description:
						'Kies een donker thema voor het momenteel actieve project',
				},
				localLightTheme: {
					name: 'Lokaal Licht Thema',
					description:
						'Kies een licht thema voor het momenteel actieve project',
				},
				sidebarRight: {
					name: 'Zijbalk rechts',
					description:
						'Verplaatst de zijbalk naar de rechterkant van het scherm',
				},
				shrinkSidebarElements: {
					name: 'Zijbalkelementen verkleinen',
					description:
						"Verklein de grootte van de zijbalkelementen van bridge.",
				},
			},
			general: {
				name: 'Algemeen',
				language: {
					name: 'Taal',
					description: 'Kies een taal die bridge. moet gebruiken',
				},
				collaborativeMode: {
					name: 'Samenwerkingsmodus',
					description:
						'Forceert een volledige verversing van de cache bij het wisselen van project. Schakel uit als u alleen werkt en alleen bridge. gebruikt om uw project te bewerken',
				},
				packSpider: {
					name: 'Pack Spider',
					description:
						'Pack Spider verbindt bestanden binnen uw projecten en presenteert de verbindingen aan u in een virtueel bestandssysteem',
				},
				openLinksInBrowser: {
					name: 'Open koppelingen in de standaardbrowser',
					description:
						'Open links in uw standaardbrowser in plaats van een native app-venster',
				},
				resetBridgeFolder: {
					name: 'Selecteer Werkmap',
					description: 'Kies de hoofdmap waarop bridge. werkt',
				},
			},
			developer: {
				name: 'Ontwikkelaar',
				simulateOS: {
					name: 'Simuleer OS',
					description:
						'Simuleer een ander besturingssysteem om platformspecifiek gedrag te testen',
				},
				devMode: {
					name: 'Ontwikkelaarsmodus',
					description: 'Schakel de ontwikkelaarsmodus in voor deze app',
				},
			},
			actions: {
				name: 'Acties',
			},
		},
		projectFolder: {
			title: 'Project Map',
			content:
				'bridge. heeft toegang tot zijn projectmap nodig om correct te werken.',
		},
		extensionStore: {
			title: 'Uitbreiding Winkel',
			searchExtensions: 'Extensie zoeken...',
		},
		pluginInstallLocation: {
			title: 'Kies Installatielocatie',
		},
		unsavedFile: {
			title: 'Bevestig',
			description:
				'Wilt u uw wijzigingen in dit bestand opslaan voordat u het sluit?',
			cancel: 'Annuleren',
			noSave: 'Afsluiten',
			save: 'Opslaan & Afsluiten',
		},
		browserUnsupported: {
			title: 'Niet-ondersteunde browser',
			description:
				'Uw browser wordt momenteel niet ondersteund. Gebruik Chrome (Desktop) of Edge (Chromium) om aan de slag te gaan met bridge.!',
		},
	},
	taskManager: {
		tasks: {
			packIndexing: {
				title: 'Pakketten Indexeren',
				description:
					'bridge. verzamelt gegevens over uw pakket die nodig zijn voor zijn intelligente functies.',
			},
			compiler: {
				title: 'Project Compileren',
				description:
					'bridge. compileert uw project om het klaar te maken om in Minecraft te importeren.',
			},
		},
	},
}

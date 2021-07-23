import { nl } from 'vuetify/src/locale'

export default {
	...nl,
	languageName: 'Nederlands',
	// Common translations - should help stop unnecessarily repeating keys
	general: {
		yes: 'Ja',
		no: 'Nee',
		okay: 'Oke',
		confirm: 'Bevestig',
		cancel: 'Annuleer',
		close: 'Sluit',
		reload: 'Herlaad',
		information: 'Informatie',
		continue: 'Doorgaan',
		delete: 'Verwijderen',
		skip: 'Overslaan',
		selectFolder: 'Selecteer Map',
		fileName: 'Bestandsnaam',
		confirmOverwriteFile:
			'Er bestaat al een bestand met deze naam. Wil je het overschrijven?',
	},
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
			description:
				'Geef spelers een wereld om te verkennen',
		},
	},
	// File Type display names
	fileType: {
		manifest: 'Manifest',
		animation: 'Animation',
		animationController: 'Animation Controller',
		biome: 'Biome',
		block: 'Block',
		bridgeConfig: 'Projectconfiguratie',
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
		searchFile: {
			name: 'Zoek Bestand',
			description: 'Zoek en open een bestand in het huidige project',
		},
		saveFile: {
			name: 'Bestand Opslaan',
			description: 'Sla het momenteel geopende bestand op',
		},
		saveAs: {
			name: 'Opslaan Als',
			description:
				'Sla het momenteel geopende bestand op onder een andere naam',
		},
		saveAll: {
			name: 'Alles Opslaan',
			description: 'Alle momenteel geopende bestanden opslaan',
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
		reloadExtensions: {
			name: 'Herlaad Extensies',
			description: 'Laadt alle extensies opnieuw',
		},
		moveToSplitScreen: {
			name: 'Verplaats naar gesplitst scherm',
			description: 'Opent een gesplitste schermweergave en verplaatst dit tabblad ernaar',
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
		clearAllNotifications: {
			name: 'Wis Alle Meldingen',
			description: 'Wist alle huidige meldingen',
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
		toObject: {
			name: 'Transformeren naar Object',
		},
		toArray: {
			name: 'Transformeren naar Reeks',
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
			updateExtensions: 'Werk alle extensies bij',
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
		loadingWindow: {
			titles: {
				loading: 'Laden...',
				downloadingData: 'Nieuwe gegevens downloaden...',
			},
		},
		changelogWindow:{
			title: "Wat is er nieuw?"
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
			scripting: 'Schakel Scripting API in',
			gameTest: 'Schakel GameTest Framework in',
			rpAsBpDependency:
				'Registreer resourcepakket als afhankelijkheid van gedragspakket',
			useLangForManifest:
				'Voeg de naam/beschrijving van het pakket rechtstreeks toe aan het manifest',
			create: 'Creëer!',
		},
		createPreset: {
			title: 'Voorinstelling maken',
			searchPresets: 'Voorinstellingen zoeken...',
			overwriteFiles:
				'Deze voorinstelling overschrijft één of meerdere bestaande bestanden. Wilt u doorgaan?',
			overwriteFilesConfirm: 'Doorgaan',
			overwriteUnsavedChanges:
				'Deze voorinstelling overschrijft een of meer bestanden met niet-opgeslagen wijzigingen. Wil je doorgaan?',
			overwriteUnsavedChangesConfirm: 'Doorgaan',
			validationRule: {
				alphanumeric:
					'U mag alleen alfanumerieke tekens en/of onderstrepingstekens gebruiken',
				lowercase: 'U mag alleen kleine letters gebruiken',
				required: 'Dit veld is verplicht',
				noEmptyFolderNames: 'De mapnaam mag niet leeg zijn',
			},
		},
		deleteProject: {
			confirm: 'Verwijderen',
			description: 'Weet u zeker dat u dit project wilt verwijderen?',
		},
		discord: {
			title: 'Socials',
			content:
				'Bekijk onze Twitter, Github en sluit je aan bij de officiële bridge. Discord server!',
			discord: 'Discord',
			twitter: 'Twitter',
			github: 'Github',
		},
		projectChooser: {
			title: 'Projecten',
			searchProjects: 'Zoek Projecten...',
			newProject: 'Nieuw Project',
		},
		filePath: {
			title: 'Kies Bestandspad',
		},
		packExplorer: {
			title: 'Pack Explorer',
			searchFiles: 'Zoek bestanden...',
			categories: 'Categorieën',
			refresh: {
				name: 'Vernieuw Project',
				description: 'Haal het huidige project op voor nieuw toegevoegde bestanden',
			},
			restartDevServer: {
				name: 'Herstart Dev Server',
				description:
					"Weet u zeker dat u de dev server van de compiler opnieuw wilt starten? Dit kan enige tijd duren, afhankelijk van de grootte van uw project.",
			},
			createPreset: 'Nieuw Bestand',
			projectConfig: {
				name: 'Projectconfiguratie openen',
				missing:
					'Het lijkt erop dat dit project geen config.json bestand heeft. Elk project heeft een projectconfiguratie nodig om correct te kunnen werken.',
			},
			fileActions: {
				delete: {
					name: 'Verwijderen',
					description: 'Verwijder een bestand of map',
					confirmText:
						"Weet u zeker dat u dit bestand wilt verwijderen? U kunt het later niet meer herstellen!",
				},
				rename: {
					name: 'Hernoemen',
					description: 'Een bestand hernoemen',
				},
				duplicate: {
					name: 'Dupliceren',
					description: 'Een bestand dupliceren',
				},
				revealFilePath: {
					name: 'Bestandspad onthullen',
					description: 'Geeft de locatie van een bestand of map weer',
				},
			},
		},
		settings: {
			title: 'Instellingen',
			searchSettings: 'Zoek instellingen...',
			sidebar: {
				name: 'Zijbalk',
				sidebarRight: {
					name: 'Zijbalk Rechts',
					description:
						'Verplaatst de zijbalk naar de rechterkant van het scherm',
				},
				sidebarSize: {
					name: 'Grootte zijbalk',
					description:
						'Wijzigt de breedte van het uitgevouwen zijbalkgebied.',
				},
				shrinkSidebarElements: {
					name: 'Zijbalkelementen verkleinen',
					description:
						"De grootte van bridge.'s zijbalkelementen verkleinen",
				},
			},
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
				formatOnSave: {
					name: 'Opmaken na opslaan',
					description: 'Maakt uw tekstbestanden op na het opslaan',
				},
				openLinksInBrowser: {
					name: 'Open koppelingen in de standaardbrowser',
					description:
						'Open links in uw standaardbrowser in plaats van een native app-venster',
				},
				restoreTabs: {
					name: 'Herstel tabbladen',
					description:
						'Herstel uw tabbladen van de laatste keer dat u bridge. gebruikte bij het openen van de app',
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
			audio: {
				name: 'Audio',
				volume: {
					name: 'Audio Ingeschakeld',
					description: 'Alle brige geluiden in- of uitschakelen',
				},
			},
			actions: {
				name: 'Acties',
			},
			editor: {
				jsonEditor: {
					name: 'JSON Editor',
					description: 'Kies hoe u JSON bestanden wilt bewerken',
				},
				wordWrap: {
					name: 'Woordomloop',
					description: 'Wikkel woorden om horizontaal scrollen uit te schakelen',
				},
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
			activateExtension: 'Activeer extensie',
			deactivateExtension: 'Extensie Deactiveren',
			offlineError:
				'Kan extensies niet laden. Controleer of uw apparaat een actieve netwerkverbinding heeft.',
		},
		pluginInstallLocation: {
			title: 'Kies Installatielocatie',
		},
		unsavedFile: {
			description:
				'Wilt u uw wijzigingen in dit bestand opslaan voordat u het sluit?',
			save: 'Opslaan & Afsluiten',
		},
		browserUnsupported: {
			title: 'Niet-ondersteunde browser',
			description:
				'Uw browser wordt momenteel niet ondersteund. Gebruik Chrome (Desktop) of Edge (Chromium) om aan de slag te gaan met bridge.!',
		},
		invalidJson: {
			title: 'Ongeldige JSON',
			description:
				'bridge.\'s tree editor kan geen bestanden openen die ongeldige JSON bevatten. U kunt binnen de instellingen overschakelen naar het editortype "Onbewerkte Tekst" om het probleem handmatig op te lossen.',
		},
	},
	taskManager: {
		tasks: {
			dataLoader: {
				title: 'Gegevens Downloaden...',
				description: 'De nieuwste gegevens aan het downloaden voor de editor',
			},
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
	fileDropper: {
		importFiles: 'Zet bestanden hier neer om ze te importeren!',
		importFailed: 'bridge. kon de volgende bestanden niet importeren:',
		andMore: '...en meer!',
		importMethod: 'Importeer Methode',
		saveToProject: {
			title: 'Save to Project',
			description1: 'Het bestand opslaan ',
			description2: ' in uw project.',
		},
		openFile: {
			title: 'Open bestand',
			description1: 'Open het bestand ',
			description2: ' en sla de bewerkingen op in het originele bestand.',
		},
	},
	comMojang: {
		folderDropped:
			'Wilt u deze map instellen als uw standaard com.mojang map?',
		title: 'Toegang tot map "com.mojang"',
		permissionRequest:
			'bridge. heeft toegang nodig tot uw "com.mojang" map om er projecten naar te kunnen compileren.',
	},
	findAndReplace: {
		name: 'Zoek & Vervang',
		search: 'Zoeken',
		replace: 'Vervangen',
		replaceAll: 'Vervang Alles',
		noResults: 'Geen resultaten gevonden.',
		noSearch:
			'Zodra u begint met typen, worden de resultaten voor uw zoekopdracht hier weergegeven.',
	},
	preview: {
		name: 'Voorbeeld',
		viewAnimation: 'Bekijk Animatie',
		viewModel: 'Bekijk Model',
		viewParticle: 'Bekijk Particle',
		viewEntity: 'Bekijk Entity',
		viewBlock: 'Bekijk Blok',
		failedClientEntityLoad: 'Kon de verbonden client entity niet laden',
		invalidEntity:
			'Kan voorbeeld niet openen voor een entiteit met ongeldige JSON. Corrigeer JSON-fouten in het bestand en probeer het opnieuw.',
		chooseGeometry: 'Kies Geometrie',
		noGeometry:
			'Geen geldige geometrie gevonden in dit bestand. Zorg ervoor dat uw JSON geldig is en dat de bestandsstructuur correct is.',
	},
	initialSetup: {
		welcome: 'Welkom bij bridge. v2!',
		welcomeCaption: 'Een krachtige IDE voor Minecraft Add-Ons',
		step: {
			installApp: {
				name: 'bridge. installeren',
				description:
					'Voor de beste ervaring, installeert u bridge. v2 als app op uw computer.',
			},
			bridge: {
				name: 'bridge. Map',
				description:
					'Maak een map waarin bridge. app-gerelateerde gegevens en uw add-on-projecten kan opslaan.',
			},
			comMojang: {
				name: 'com.mojang Map',
				description:
					'Sleep nu je com.mojang map naar bridge. om het synchroniseren van projecten naar deze map in te stellen. Hierdoor zijn uw add-ons automatisch toegankelijk in Minecraft voor Windows 10. Het instellen van com.mojang synchronisatie kan op elk moment wanner bridge. is geopend.',
				extraDescription: 'Sleep uw map com.mojang naar bridge.',
			},
			editorType: {
				name: 'Kies Editor Type',
				description:
					"Hoe wilt u JSON bestanden bewerken? U kunt uw keuze later in de instellingen van bridge. wijzigen!",
				rawText: {
					name: 'Onbewerkte Tekst',
					description:
						'Bewerk JSON als onbewerkte tekst. Ideaal voor gemiddelde tot gevorderde ontwikkelaars. Wordt geleverd met geavanceerde automatische aanvullingen en JSON-validatie.',
				},
				treeEditor: {
					name: 'Tree Editor',
					description:
						'Bewerk JSON als een boomachtige structuur die weinig tot geen JSON kennis vereist. Ideaal voor beginners en gemiddelde makers.',
				},
			},
		},
	},
	editors: {
		treeEditor: {
			addObject: 'Object Toevoegen',
			addArray: 'Reeks Toevoegen',
			addValue: 'Waarde Toevoegen',
			edit: 'Bewerk',
		},
	},
}

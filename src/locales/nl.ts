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
		select: 'Selecteren',
		skip: 'Overslaan',
		save: 'Opslaan',
		more: 'Meer...',
		selectFolder: 'Selecteer Map',
		fileName: 'Bestandsnaam',
		folderName: 'Map Naam',
		inactive: 'Inactief',
		active: 'Actief',

		confirmOverwriteFile:
			'Er bestaat al een bestand met deze naam. Wil je het overschrijven?',
		confirmOverwriteFolder:
			'Er bestaat al een map met deze naam. Wil je het overschrijven?',
		fileSystemPolyfill:
			'Vanwege de browser die u gebruikt, moet u uw projecten downloaden om uw voortgang daadwerkelijk op te slaan. Dit is niet nodig als u Chrome of Edge gebruikt!',
		successfulExport: {
			title: 'Exporteren succesvol',
			description: 'U kunt het geëxporteerde pakket hier vinden',
		},
		experimentalGameplay: 'Experimental Gameplay',
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
		documentationLookup: {
			name: 'Documentatie bekijken',
			noDocumentation: 'Geen documentatie beschikbaar voor',
		},
		toggleReadOnly: {
			name: 'Schakel Alleen-Lezen Modus',
			description: 'Schakel alleen-lezen modus voor het momenteel geopende bestand',
		},
		keepInTabSystem: {
			name: 'Houd in Tab Systeem',
			description: 'Converteert dit tabblad naar een permanent tabblad',
		},
		importBrproject: {
			name: 'Project importeren',
			description: 'Een project importeren uit een .brproject bestand',
		},
		downloadFile: {
			name: 'Download bestand',
			description: 'Download het momenteel geopende bestand',
		},
		undo: {
			name: 'Ongedaan maken',
			description: 'De laatste actie ongedaan maken',
		},
		redo: {
			name: 'Opnieuw uitvoeren',
			description: 'Voer de laatste actie opnieuw uit',
		},
	},
	// Toolbar Categories
	toolbar: {
		project: {
			name: 'Project',
		},
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
			default: {
				name: 'Default Config',
				description:
					'Voer bridge.\'s compiler uit met de standaard compilerconfiguratie die deel uitmaakt van het "config.json" bestand van uw project.',
			},
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
	// Experimental gameplay toggles
	experimentalGameplay: {
		cavesAndCliffs: {
			name: 'Caves and Cliffs',
			description:
				'Maakt automatische aanvullingen mogelijk voor de nieuwe berggeneratie in biomen.',
		},
		holidayCreatorFeatures: {
			name: 'Holiday Creator Features',
			description:
				'Schakelt automatische aanvullingen in voor de gegevensgestuurde item- en blokfuncties.',
		},
		creationOfCustomBiomes: {
			name: 'Creation of Custom Biomes',
			description:
				'Maakt het maken van aangepaste biomen, features en feature rules mogelijk.',
		},
		additionalModdingCapabilities: {
			name: 'Additional Modding Capabilities',
			description:
				'Schakelt de Scripting API in het manifest in en stelt u in staat om scripts te maken met automatische aanvullingen.',
		},
		upcomingCreatorFeatures: {
			name: 'Upcoming Creator Features',
			description:
				'Maakt het maken van fog volume bestanden mogelijk en biedt automatische aanvullingen voor entity eigenschappen.',
		},
		enableGameTestFramework: {
			name: 'Enable GameTest Framework',
			description:
				'Schakelt de GameTest gerelateerde modules in het manifest in en stelt u in staat om GameTest scripts te maken met automatische aanvullingen.',
		},
		experimentalMolangFeatures: {
			name: 'Experimental Molang Features',
			description:
				'Schakelt automatische aanvullingen in voor experimentele Molang queries.',
		},
		educationEdition: {
			name: 'Enable Education Edition',
			description:
				'Schakelt automatische aanvullingen in voor educatieve functies, zoals recepten voor materiaalreductie.',
		},
	},
	// Windows
	windows: {
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
			projectName: {
				name: 'Projectnaam',
				invalidLetters: 'U mag alleen alfanumerieke tekens gebruiken',
				mustNotBeEmpty: 'U moet een projectnaam invoeren',
			},
			projectDescription: 'Projectbeschrijving (optioneel)',
			projectPrefix: 'Projectvoorvoegsel',
			projectAuthor: 'Project Auteur',
			projectTargetVersion: 'Doelversie van het project',
			rpAsBpDependency:
				'Registreer resourcepakket als afhankelijkheid van gedragspakket',
			useLangForManifest:
				'Voeg de naam/beschrijving van het pakket rechtstreeks toe aan het manifest',
			create: 'Creëer!',
			saveCurrentProject:
				'Wilt u uw huidige project opslaan voordat u een nieuwe maakt? Alle niet-opgeslagen wijzigingen gaan verloren!',
			individualFiles: {
				name: 'Individuele Bestanden',
				file: {
					player: {
						name: 'player.json',
						description: 'Bewerk hoe de standaardspeler zich gedraagt',
					},
					tick: {
						name: 'tick.json',
						description:
							'Definieer welke functies elke tick moeten worden uitgevoerd',
					},
					skins: {
						name: 'skins.json',
						description: 'Registreer de skins die je hebt gemaakt',
					},
					blocks: {
						name: 'blocks.json',
						description:
							'Wordt gebruikt om te definiëren hoe meerdere blokvlakken worden gecombineerd tot een enkel blok',
					},
					terrainTexture: {
						name: 'terrain_texture.json',
						description: 'Wordt gebruikt om texturen toe te wijzen aan de vlakken van een blok',
					},
					itemTexture: {
						name: 'item_texture.json',
						description: 'Wordt gebruikt om texturen aan items toe te wijzen',
					},
					flipbookTextures: {
						name: 'flipbook_textures.json',
						description: 'Gebruikt voor het animeren van blok texturen',
					},
					biomesClient: {
						name: 'biomes_client.json',
						description:
							'Wordt gebruikt om te definiëren hoe bioom specifieke effecten worden weergegeven',
					},
					sounds: {
						name: 'sounds.json',
						description:
							'Gebruikt om geluiden te definiëren voor specifieke gamefuncties',
					},
					soundDefinitions: {
						name: 'sound_definitions.json',
						description:
							'Wordt gebruikt om id\'s te registreren voor geluidsbestanden die elders in het project kunnen worden gebruikt',
					},
				},
			},
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
			description: 'Selecteer het momenteel actieve project',
			searchProjects: 'Zoek Projecten...',
			newProject: {
				name: 'Nieuw Project',
				description: 'Maak een nieuw bridge. project.',
			},

			saveCurrentProject: {
				name: 'Project Opslaan',
				description:
					'Download uw huidige project als een .brproject bestand om de aangebrachte wijzigingen op te slaan.',
			},
			openNewProject: {
				name: 'Open Project',
				description:
					'Open een ander project door het bijbehorende .brproject bestand te selecteren.',
				saveCurrentProject:
					'Wilt u uw huidige project opslaan voordat u het nieuwe laadt?',
			},
			wrongFileType: 'Project moet een .brproject bestand zijn',
			addPack: 'Pakket Toevoegen',
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
			exportAsMcaddon: {
				name: 'Exporteer als .mcaddon',
			},
			exportAsMctemplate: {
				name: 'Exporteer als .mctemplate',
				chooseWorld: 'Kies een wereld',
			},
			exportAsMcworld: {
				name: 'Exporteer als .mcworld',
				chooseWorld: 'Kies een wereld',
			},
			exportAsBrproject: {
				name: 'Exporteer als .brproject',
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
				viewCompilerOutput: {
					name: 'Uitvoer van compiler bekijken',
					description:
						'Bekijk de huidige compiler output voor dit bestand',
					fileMissing:
						"Het lijkt erop dat dit bestand nog niet is gecompileerd.",
				},
				revealFilePath: {
					name: 'Bestandspad onthullen',
					description: 'Geeft de locatie van een bestand of map weer',
				},
				createFile: {
					name: 'Bestand aanmaken',
					description: 'Maak een nieuw bestand',
				},
				createFolder: {
					name: 'Map aanmaken',
					description: 'Maak een nieuwe map',
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
				fontSize: {
					name: 'Lettergrootte',
					description: "Wijzig de lettergrootte van de tekst van bridge.",
				},
				editorFontSize: {
					name: 'Code Lettergrootte',
					description:
						"Wijzig de lettergrootte van de code editor van bridge.",
				},
				editorFont: {
					name: 'Code Lettertype',
					description: "Wijzig het lettertype van de code editor van bridge.",
				},
				font: {
					name: 'Lettertype',
					description:
						"Wijzig het lettertype dat in de gebruikersinterface van bridge. wordt gebruikt",
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
				openProjectChooserOnAppStartup: {
					name: 'Projectkiezer openen',
					description:
						'Open automatisch de projectkiezer bij het starten van bridge.',
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
				wordWrapColumns: {
					name: 'Woordomloop Kolommen',
					description:
						'Definieert na hoeveel kolommen de editor woorden moet laten omlopen',
				},
				compactTabDesign: {
					name: 'Compact tabbladontwerp',
					description:
						'Toon tabbladen in het tabbladsysteem op een compactere manier',
				},
				automaticallyOpenTreeNodes: {
					name: 'Automatisch Tree Nodes Openen',
					description:
						"Binnen in bridge.'s tree editor, open automatisch nodes wanneer je ze selecteert",
				},
				dragAndDropTreeNodes: {
					name: 'Tree Nodes Slepen en Neerzetten',
					description:
						"Schakel tussen slepen & neerzetten voor tree nodes in bridge.'s tree editor",
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
			deleteExtension: 'Extensie Verwijderen',
			activateExtension: 'Extensie Activeren',
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
			continue: 'Toch doorgaan',
		},
		invalidJson: {
			title: 'Ongeldige JSON',
			description:
				'bridge.\'s tree editor kan geen bestanden openen die ongeldige JSON bevatten. U kunt binnen de instellingen overschakelen naar het editortype "Onbewerkte Tekst" om het probleem handmatig op te lossen.',
		},
		loadingWindow: {
			titles: {
				loading: 'Bezig met laden...',
			},
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
			unzipper: {
				name: 'ZIP uitpakken',
				description: 'bridge. is momenteel bezig met het uitpakken van een ZIP-bestand.',
			},
			loadingSchemas: {
				name: 'Automatische Aanvullingen Laden',
				description:
					'bridge. is momenteel bezig met het laden van de gegevens voor automatische aanvullingen.',
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
		status: {
			sucess: 'Het synchroniseren van uw projecten met com.mojang is correct ingesteld.',
			deniedPermission:
				'U heeft com.mojang synchronisatie ingesteld, maar u heeft bridge. geen toestemming verleend voor de map.',
			notSetup: 'U heeft com.mojang synchronisatie nog niet ingesteld.',
			notAvailable:
				'Het synchroniseren van projecten naar de com.mojang map is alleen beschikbaar voor Chrome en Edge gebruikers.',
		},
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
			bridgeProject: {
				name: 'bridge. Project',
				description:
					'Wilt u een nieuw project aanmaken of een bestaand project importeren vanuit een .brproject-bestand?',
				createNew: {
					name: 'Nieuw Project',
					description: 'Maak een nieuw project.',
				},
				importExisting: {
					name: 'Importeer Project',
					description: 'Importeer een bestaand project.',
				},
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

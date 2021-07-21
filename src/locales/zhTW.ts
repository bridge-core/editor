import { zhHant } from 'vuetify/src/locale'

export default {
	...zhHant,
	languageName: '中文(臺灣)',
	// Common translations - should help stop unnecessarily repeating keys
	general: {
		yes: '是',
		no: '否',
		okay: '好',
		confirm: '確認',
		cancel: '取消',
		close: '關閉',
		reload: '重新載入',
		information: '資訊',
		continue: '繼續',
		delete: '刪除',
		skip: '跳過',
		selectFolder: '選取資料夾',
		fileName: '檔案名稱',
		confirmOverwriteFile: '已存在相同名稱的檔案，是否要覆寫?',
	},
	packType: {
		behaviorPack: {
			name: '行為包',
			description: '在遊戲中創造新的機制，以及修改Minecraft的行為。',
		},
		resourcePack: {
			name: '資源包',
			description: '用於修改Minecrat的外觀和音效',
		},
		skinPack: {
			name: '外觀包',
			description: '創建可以讓玩家自由使用的全新外觀。',
		},
		worldTemplate: {
			name: '世界範本',
			description: '創造讓玩家能夠體驗你的專案的世界。',
		},
	},
	// File Type display names
	fileType: {
		manifest: 'Manifest',
		animation: '動畫',
		animationController: '動畫控制器',
		biome: '生態域',
		block: '方塊',
		bridgeConfig: 'bridge.專案設定',
		dialogue: '對話框',
		entity: '實體',
		feature: '地物',
		featureRule: '地物生成規則',
		functionTick: 'Tick函數',
		function: '函數',
		item: '物品',
		lootTable: '戰利品表',
		recipe: '合成配方',
		clientScript: '使用者端腳本',
		serverScript: '伺服器端腳本',
		script: '腳本',
		spawnRule: '生成規則',
		mcstructure: '結構',
		tradeTable: '交易表',
		clientManifest: '使用者端Manifest',
		skinManifest: '外觀Manifest',
		geometry: '幾何體',
		customComponent: '組件',
		clientAnimation: '使用者端動畫',
		clientAnimationController: '使用者端動畫控制器',
		attachable: '可附加物品',
		clientEntity: '使用者端實體',
		clientItem: '使用者端物品',
		clientLang: '語言',
		fog: '霧',
		particle: '粒子',
		renderController: '渲染控制器',
		texture: '材質',
		textureSet: '材質集',
		itemTexture: '物品材質',
		clientBlock: '使用者端方塊',
		terrainTexture: '地形材質',
		flipbookTexture: 'Flipbook材質',
		clientBiome: '使用者端生態域',
		soundDefinition: '聲音定義',
		musicDefinition: '音樂定義',
		clientSound: '使用者端聲音',
		skins: '外觀',
		langDef: '語言定義',
		lang: '語言',
		molang: 'Molang',
		gameTest: '遊戲測試',
		unknown: '其他',
		simpleFile: '純檔案',
		ui: 'UI',
		volume: '功能域',
		worldManifest: '世界Manifest',
	},
	// Actions
	actions: {
		newProject: {
			name: '新建專案',
			description: '新建一個bridge.專案',
		},
		newFile: {
			name: '新增檔案',
			description: '新建一個Add-On功能',
		},
		openFile: {
			name: '開啟檔案',
			description: '從此專案開啟檔案',
		},
		searchFile: {
			name: '搜尋檔案',
			description: '在此專案中搜尋',
		},
		saveFile: {
			name: '儲存檔案',
			description: '儲存開啟的檔案',
		},
		saveAs: {
			name: '另存新檔',
			description: '以不同檔名儲存開啟的檔案',
		},
		saveAll: {
			name: '全部儲存',
			description: '儲存全部開啟的檔案',
		},
		closeFile: {
			name: '關閉檔案',
			description: '關閉開啟的檔案',
		},
		settings: {
			name: '設定',
			description: '開啟bridge.的設定',
		},
		extensions: {
			name: '擴充元件',
			description: '安裝和管理擴充元件',
		},
		copy: {
			name: '複製',
			description: '將選取的文字複製到剪貼簿',
		},
		cut: {
			name: '剪下',
			description: '將選取的文字剪下',
		},
		paste: {
			name: '貼上',
			description: '貼上剪貼簿的內容',
		},
		docs: {
			name: '文檔',
			description: '開啟Minecraft Add-On文檔',
		},
		releases: {
			name: '發行版',
			description: '查看最新的bridge.發行版',
		},
		bugReports: {
			name: '問題回報',
			description: '回報bridge.的問題',
		},
		extensionAPI: {
			name: '擴充元件API',
			description: '查看bridge.擴充元件API的說明',
		},
		gettingStarted: {
			name: '新手上路',
			description: '查看我們的bridge.入門指南',
		},
		faq: {
			name: '常見問題',
			description: '查看使用bridge.開發Add-On常見的問題',
		},
		reloadAutoCompletions: {
			name: '重新載入自動完成',
			description: '重新載入自動完成的資料',
		},
		reloadExtensions: {
			name: '重新載入擴充元件',
			description: '重新載入所有擴充元件',
		},
		moveToSplitScreen: {
			name: '移至分割視窗',
			description: '將這個頁籤移至新開啟的分割視窗',
		},
		closeTab: {
			name: '關閉頁籤',
			description: '關閉這個頁籤',
		},
		closeAll: {
			name: '全部關閉',
			description: '關閉全部的頁籤',
		},
		closeTabsToRight: {
			name: '關閉右邊的頁籤',
			description: '關閉右邊所有的頁籤',
		},
		closeAllSaved: {
			name: '關閉已儲存的頁籤',
			description: '關閉所有已儲存的頁籤',
		},
		closeOtherTabs: {
			name: '關閉其他頁籤',
			description: '關閉其他的頁籤',
		},
		clearAllNotifications: {
			name: '清除全部通知',
			description: '清除全部的通知',
		},
		pluginInstallLocation: {
			global: {
				name: '全域安裝',
				description: '所有專案皆可使用全域擴充元件',
			},
			local: {
				name: '區域安裝',
				description: '僅有安裝該擴充元件的專案可以使用',
			},
		},
		toObject: {
			name: '轉換成物件',
		},
		toArray: {
			name: '轉換成陣列',
		},
	},
	// Toolbar Categories
	toolbar: {
		file: {
			name: '檔案',
			preferences: {
				name: '偏好設定',
			},
		},
		edit: {
			name: '編輯',
		},
		tools: {
			name: '工具',
		},
		help: {
			name: '幫助',
		},
	},
	// Sidebar tabs
	sidebar: {
		compiler: {
			name: '編譯器',
		},
		extensions: {
			name: '擴充元件',
		},

		notifications: {
			socials: {
				message: '社群媒體',
			},
			gettingStarted: {
				message: '新手上路',
			},
			installApp: {
				message: '安裝應用程式',
			},
			updateAvailable: {
				message: '有更新可用',
			},
			updateExtensions: '更新全部的擴充元件',
		},
	},
	// Welcome Screen
	welcome: {
		title: '歡迎使用bridge.',
		subtitle: '製作Minecraft Add-On從沒如此便捷過!',
		quickActions: '快捷動作',
		recentFiles: '最近開啟的檔案',
		recentProjects: '最近的專案',
	},
	// Windows
	windows: {
		loadingWindow: {
			titles: {
				loading: '載入中...',
				downloadingData: '下載新資料...',
			},
		},
		changelogWindow: {
			title: '新功能',
		},
		openFile: {
			title: '開啟',
			search: '搜尋檔案...',
			noData: '沒有結果...',
		},
		createProject: {
			welcome: '歡迎使用bridge.!',
			welcomeDescription: '新增你的第一個專案。',
			omitPack: '忽略',
			selectedPack: '已選取',
			title: '新增專案',
			packIcon: '專案圖示(選擇性)',
			projectName: '專案名稱',
			projectDescription: '專案簡介(選擇性)',
			projectPrefix: '專案前綴',
			projectAuthor: '專案作者',
			projectTargetVersion: '專案對應的Minecraft版本',
			scripting: '啟用腳本API',
			gameTest: '啟用遊戲測試框架',
			rpAsBpDependency: '將資源包註冊為行為包的套件相依性',
			useLangForManifest: '直接將包名和簡介添加至manifest檔案',
			create: '新增',
		},
		createPreset: {
			title: '新增預設集',
			searchPresets: '搜尋預設集...',
			overwriteFiles: '這個預設集會覆寫一或多個檔案，是否繼續?',
			overwriteFilesConfirm: '確認',
			overwriteUnsavedChanges:
				'這個預設集會覆寫一或多個未儲存變更的檔案，是否繼續?',
			overwriteUnsavedChangesConfirm: '確認',
			validationRule: {
				alphanumeric: '只能使用英數符號或者下劃線',
				lowercase: '只能使用小寫',
				required: '此欄位為必填',
				noEmptyFolderNames: '資料夾名稱不可空白',
			},
		},
		deleteProject: {
			confirm: '刪除',
			description: '是否要刪除這個專案?',
		},
		socials: {
			title: '社群媒體',
			content: '查看bridge.的官方Twitter和Github，以及加入Discord群組!',
			discord: 'Discord',
			twitter: 'Twitter',
			github: 'Github',
		},
		projectChooser: {
			title: '專案',
			searchProjects: '搜尋專案...',
			newProject: '新增專案',
		},
		filePath: {
			title: '選擇檔案路徑',
		},
		packExplorer: {
			title: '套件瀏覽器',
			searchFiles: '搜尋檔案...',
			categories: '類別',
			refresh: {
				name: '重新載入專案',
				description: '重新載入目前專案中新增的檔案',
			},
			restartDevServer: {
				name: '重新啟動Dev Server',
				description:
					'是否要重啟編譯器的Dev Server? 花費的時間依照你的專案大小而定。',
			},
			createPreset: '新增檔案',
			projectConfig: {
				name: '開啟專案設定檔',
				missing:
					'看來這個檔案沒有config.json。專案需要該檔案才能正常運作。',
			},
			fileActions: {
				delete: {
					name: '刪除',
					description: '刪除檔案或資料夾',
					confirmText: '是否要刪除這個檔案? 此動作無法還原!',
				},
				rename: {
					name: '重新命名',
					description: '重新命名檔案',
				},
				duplicate: {
					name: '拷貝',
					description: '拷貝檔案',
				},
				revealFilePath: {
					name: '顯示檔案路徑',
					description: '顯示檔案或資料夾的實際位置',
				},
			},
		},
		settings: {
			title: '設定',
			searchSettings: '搜尋設定...',
			sidebar: {
				name: '側邊欄',
				sidebarRight: {
					name: '側邊欄移至右方',
					description: '將側邊欄移至螢幕右方',
				},
				sidebarSize: {
					name: '側邊欄大小',
					description: '更改展開的側邊欄寬度。',
				},
				shrinkSidebarElements: {
					name: '收合側邊欄元素',
					description: '收合bridge.的側邊欄元素',
				},
			},
			appearance: {
				name: '外觀',
				colorScheme: {
					name: '配色方案',
					description: '選取bridge. UI的配色方案',
				},
				darkTheme: {
					name: '深色主題',
					description: '選取bridge.預設的深色主題',
				},
				lightTheme: {
					name: '淺色主題',
					description: '選取bridge.預設的淺色主題',
				},
				localDarkTheme: {
					name: '區域深色主題',
					description: '選取目前專案的深色主題',
				},
				localLightTheme: {
					name: '淺色主題',
					description: '選取目前專案的淺色主題',
				},
			},
			general: {
				name: '一般',
				language: {
					name: '語言',
					description: '選取bridge.的語言',
				},
				collaborativeMode: {
					name: '協作模式',
					description:
						'強制在切換專案時重新載入快取檔案。僅有您一人使用bridge.編輯專案時關閉此選項。',
				},
				packSpider: {
					name: '套件爬蟲',
					description:
						'套件爬蟲會用虛擬檔案系統為專案中的檔案建立連結，並顯示他們的關聯。',
				},
				formatOnSave: {
					name: '儲存時格式化',
					description: '在儲存時格式化檔案',
				},
				openLinksInBrowser: {
					name: '在瀏覽器中開啟連結',
					description: '使用系統預設瀏覽器開啟連結。',
				},
				restoreTabs: {
					name: '回復頁籤',
					description: '開啟birdge.時回復上一次開啟的頁籤。',
				},
				resetBridgeFolder: {
					name: '選取根目錄',
					description: '選取bridge.運作的主要目錄',
				},
			},
			developer: {
				name: '開發人員',
				simulateOS: {
					name: '模擬作業系統',
					description: '模擬作業系統用於測試特定的行為',
				},
				devMode: {
					name: '開發人員模式',
					description: '開啟開發人員模式',
				},
			},
			audio: {
				name: '音效',
				volume: {
					name: '音效已開啟',
					description: '開啟或關閉bridge.的音效',
				},
			},
			actions: {
				name: '動作',
			},
			editor: {
				jsonEditor: {
					name: 'JSON編輯器',
					description: '選擇編輯JSON檔案的方式',
				},
				wordWrap: {
					name: '自動換行',
					description: '程式碼自動換行',
				},
			},
		},
		projectFolder: {
			title: '專案資料夾',
			content: 'bridge.必須存取專案資料夾',
		},
		extensionStore: {
			title: '擴充元件商店',
			searchExtensions: '搜尋擴充元件...',
			activateExtension: '啟用擴充元件',
			deactivateExtension: '停用擴充元件',
			offlineError: '無法載入擴充元件，請確認裝置已連上網路。',
		},
		pluginInstallLocation: {
			title: '選擇安裝位置',
		},
		unsavedFile: {
			description: '是否在關閉檔案前儲存變更?',
			save: '儲存 & 關閉',
		},
		browserUnsupported: {
			title: '不支援的瀏覽器',
			description: 'bridge.不支援你的瀏覽器，請使用電腦版的Chrome或Edge!',
		},
		invalidJson: {
			title: '無效的JSON',
			description:
				'bridge.的樹狀編輯器無法開啟無效JSON檔案，你可以切換成「純文本編輯器」修改檔案。',
		},
	},
	taskManager: {
		tasks: {
			dataLoader: {
				title: '下載資料...',
				description: '下載編輯器的最新資料',
			},
			packIndexing: {
				title: '檢索套件中',
				description: 'bridge.正在為你的專案功能蒐集必要的資訊',
			},
			compiler: {
				title: '編譯專案',
				description: 'bridge.正在編譯可匯入至Minecraft的套件',
			},
		},
	},
	fileDropper: {
		importFiles: '將檔案拖放到這裡匯入!',
		importFailed: 'bridge.無法匯入以下檔案:',
		andMore: '...和更多!',
		importMethod: '匯入方法',
		saveToProject: {
			title: '儲存至專案',
			description1: '儲存檔案',
			description2: '至你的專案。',
		},
		openFile: {
			title: '開啟檔案',
			description1: '開啟檔案',
			description2: '將變更儲存至原始檔案。',
		},
	},
	comMojang: {
		folderDropped: '是否將這個資料夾設為預設的com.mojang資料夾?',
		permissionRequest: 'bridge.必須存取你的com.mojang資料夾才能編譯專案。',
	},
	findAndReplace: {
		name: '尋找 & 取代',
		search: '尋找',
		replace: '取代',
		replaceAll: '全部取代',
		noResults: '沒有結果。',
		noSearch: '輸入文字，這裡就會顯示搜尋結果。',
	},
	preview: {
		name: '預覽',
		viewAnimation: '檢視動畫',
		viewModel: '檢視模型',
		viewParticle: '檢視粒子',
		viewEntity: '檢視實體',
		viewBlock: '檢視方塊',
		failedClientEntityLoad: '無法載入連接的使用者端實體',
		invalidEntity: '實體JSON無效，無法開啟。請修正錯誤後再試一次。',
		chooseGeometry: '選擇幾何體',
		noGeometry:
			'此檔案中未找到有效的幾何體。請檢查JSON是否有效，檔案結構是否正確，以及含有指定的幾何體識別符。',
	},
	initialSetup: {
		welcome: '歡迎使用bridge. v2!',
		welcomeCaption: '一款強大的Minecraft Add-On IDE。',
		step: {
			installApp: {
				name: '安裝bridge.',
				description: '為求最佳使用體驗，將bridge. v2安裝到電腦。',
			},
			bridge: {
				name: 'bridge.的資料夾',
				description:
					'請新增一個資料夾，用於存放bridge.的相關資料與Add-On專案。',
			},
			comMojang: {
				name: 'com.mojang資料夾',
				description:
					'將您的com.mojang資料夾拖曳至bridge.，將其與專案資料夾同步。這樣可以讓Windows 10版Minecraft直接偵測到你的Add-On。之後可再修改com.mojang資料夾的同步設定。',
				extraDescription: '將您的com.mojang資料夾拖曳至bridge...',
			},
			editorType: {
				name: '選取編輯器模式',
				description: ' 您想要如何編輯JSON檔案? 之後可再修改設定。',
				rawText: {
					name: '純文本',
					description:
						'以純文本模式編輯JSON，有先進的自動完成和JSON偵錯系統，適合中階以及進階開發者。',
				},
				treeEditor: {
					name: '樹狀編輯器',
					description:
						'以樹狀模式編輯JSON，無須JSON知識，適合初階以及中階開發者。',
				},
			},
		},
	},
	editors: {
		treeEditor: {
			addObject: '加入物件',
			addArray: '新增陣列',
			addValue: '新增値',
			edit: '編輯',
		},
	},
}

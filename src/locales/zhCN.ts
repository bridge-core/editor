import { zhHans } from 'vuetify/src/locale'

export default {
	...zhHans,
	languageName: '中文(中国大陆)',
	// Common translations - should help stop unnecessarily repeating keys
	general: {
		yes: '是',
		no: '否',
		okay: '确定',
		confirm: '确认',
		cancel: '取消',
		close: '关闭',
		reload: '重载',
		information: '信息',
		continue: '继续',
		delete: '删除',
		select: '选择',
		skip: '跳过',
		save: '保存',
		more: '更多...',
		selectFolder: '选择文件夹',
		fileName: '文件名',
		inactive: '待用',
		active: '激活',
		later: '稍后',
		clear: '清除',
		reset: '重置',

		confirmOverwriteFile: '此操作会覆盖同名文件。你要继续吗？',
		fileSystemPolyfill:
			'由于你的浏览器原因，你需要将你的项目下载到本地来实际保存你的进度。如果你使用的是Chrome（除了Chrome 93或94）或Edge，就无需这么做了！',
		successfulExport: {
			title: '导出成功',
			description: '你可以在这里找到导出的包',
		},
		experimentalGameplay: '实验性玩法',
		textureLocation: '纹理位置',
	},
	packType: {
		behaviorPack: {
			name: '行为包',
			description: '创建新的游戏机制并改变Minecraft的行为方式',
		},
		resourcePack: {
			name: '资源包',
			description: '用于改变Minecraft的外观和声音',
		},
		skinPack: {
			name: '皮肤包',
			description: '提供玩家角色可以选择的全新样貌',
		},
		worldTemplate: {
			name: '世界模板',
			description:
				'创建一个世界，其他用户可以通过在游戏中创建这个世界来体验你的项目',
		},
	},
	// File Type display names
	fileType: {
		manifest: '清单',
		animation: '动画',
		animationController: '动画控制器',
		biome: '生物群系',
		block: '方块',
		bridgeConfig: '项目配置',
		dialogue: '对话',
		entity: '实体',
		feature: '地物',
		featureRule: '地物规则',
		functionTick: '函数滴答',
		function: '函数',
		item: '物品',
		lootTable: '战利品表',
		recipe: '配方',
		clientScript: '客户端脚本',
		serverScript: '服务端脚本',
		script: '脚本',
		spawnRule: '生成规则',
		mcstructure: '结构',
		tradeTable: '交易表',
		clientManifest: '客户端清单',
		skinManifest: '皮肤清单',
		geometry: '几何',
		customCommand: '命令',
		customComponent: '组件',
		clientAnimation: '客户端动画',
		clientAnimationController: '客户端动画控制器',
		attachable: '附着物',
		clientEntity: '客户端实体',
		clientItem: '客户端物品',
		clientLang: '语言',
		fog: '迷雾',
		particle: '粒子',
		renderController: '渲染控制器',
		texture: '纹理',
		textureSet: '纹理集',
		itemTexture: '物品纹理',
		clientBlock: '客户端方块',
		terrainTexture: '地形纹理',
		flipbookTexture: '翻书纹理',
		clientBiome: '客户端生物群系',
		soundDefinition: '音效定义',
		musicDefinition: '音乐定义',
		clientSound: '客户端声音',
		skins: '皮肤',
		langDef: '语言定义',
		lang: '语言',
		molang: 'Molang',
		gameTest: 'GameTest',
		unknown: '其他',
		simpleFile: '简单文件',
		ui: 'UI',
		volume: '功能域',
		worldManifest: '世界清单',
	},
	// Actions
	actions: {
		newProject: {
			name: '新建项目',
			description: '创建一个新的bridge.项目',
		},
		newFile: {
			name: '新建文件',
			description: '创建一个新的附加包功能',
		},
		openFile: {
			name: '打开文件',
			description: '从当前项目中打开一个文件',
		},
		searchFile: {
			name: '搜索文件',
			description: '从当前项目中搜索并打开一个文件',
		},
		saveFile: {
			name: '保存文件',
			description: '保存当前打开的文件',
		},
		saveAs: {
			name: '另存为',
			description: '以不同的名称保存当前打开的文件',
		},
		saveAll: {
			name: '保存全部',
			description: '保存当前打开的全部文件',
		},
		closeFile: {
			name: '关闭文件',
			description: '关闭当前打开的文件',
		},
		settings: {
			name: '设置',
			description: '打开bridge.的应用设置',
		},
		extensions: {
			name: '扩展',
			description: '安装和管理已安装的扩展',
		},
		copy: {
			name: '复制',
			description: '将选定的文本复制到剪贴板',
		},
		cut: {
			name: '剪切',
			description: '将选定的文本复制到剪贴板并将其从原始上下文中删除',
		},
		paste: {
			name: '粘贴',
			description: '粘贴剪贴板内容',
		},
		docs: {
			name: '文档',
			description: '打开Minecraft附加包文档',
		},
		releases: {
			name: '发布版本',
			description: '查看最新的bridge.发布版本',
		},
		bugReports: {
			name: '漏洞报告',
			description: '报告一个bridge.的议题',
		},
		extensionAPI: {
			name: '扩展API',
			description: '阅读有关bridge.扩展API的更多信息',
		},
		gettingStarted: {
			name: '新手入门',
			description: '阅读有关如何开始使用bridge.的指南',
		},
		faq: {
			name: '常见问题解答',
			description: '阅读有关使用bridge.开发附加包的常见问题解答',
		},
		reloadAutoCompletions: {
			name: '重载自动补全',
			description: '重载所有自动补全数据',
		},
		reloadExtensions: {
			name: '重载扩展',
			description: '重载所有扩展',
		},
		moveToSplitScreen: {
			name: '移至分屏',
			description: '打开一个分屏视图并将此标签页移动至分屏',
		},
		closeTab: {
			name: '关闭标签页',
			description: '关闭此标签页',
		},
		closeAll: {
			name: '关闭全部',
			description: '关闭全部标签页',
		},
		closeTabsToRight: {
			name: '关闭右侧的标签页',
			description: '关闭此标签页右侧的全部标签页',
		},
		closeAllSaved: {
			name: '关闭全部既存',
			description: '关闭已保存的全部标签页',
		},
		closeOtherTabs: {
			name: '关闭其他标签页',
			description: '关闭除此标签页之外的全部标签页',
		},
		clearAllNotifications: {
			name: '清空全部通知',
			description: '清空当前的全部通知',
		},
		pluginInstallLocation: {
			global: {
				name: '全局安装',
				description: '全局扩展在你的所有项目中都可以访问',
			},
			local: {
				name: '局部安装',
				description: '局部扩展只能它被添加到的项目内部可以访问',
			},
		},
		toObject: {
			name: '变换为对象',
		},
		toArray: {
			name: '变换为数组',
		},
		documentationLookup: {
			name: '查看文档',
			noDocumentation: '没有可用的文档适用于',
		},
		toggleReadOnly: {
			name: '切换只读模式',
			description: '为当前打开的文件切换只读模式',
		},
		keepInTabSystem: {
			name: '固定在标签页系统中',
			description: '将此标签页转换为永久性标签页',
		},
		importBrproject: {
			name: '导入项目',
			description: '从一个.brproject文件导入一个项目',
		},
		downloadFile: {
			name: '下载文件',
			description: '下载当前打开的文件',
		},
		undo: {
			name: '撤销',
			description: '撤消最后一次操作',
		},
		redo: {
			name: '重做',
			description: '重做最后一次操作',
		},
		goToDefinition: {
			name: '转到定义',
			description: '转到所选符号的定义',
		},
		goToSymbol: {
			name: '转到符号',
			description: '打开一个对话框以选择要转到的符号',
		},
		formatDocument: {
			name: '格式化文档',
			description: '格式化当前打开的文档',
		},
		changeAllOccurrences: {
			name: '更改所有匹配项',
			description: '更改所选文本的所有匹配项',
		},
	},
	// Toolbar Categories
	toolbar: {
		project: {
			name: '项目',
		},
		file: {
			name: '文件',
			preferences: {
				name: '首选项',
			},
		},
		edit: {
			name: '编辑',
		},
		tools: {
			name: '工具',
		},
		help: {
			name: '帮助',
		},
	},
	// Sidebar tabs
	sidebar: {
		compiler: {
			name: '编译器',
			default: {
				name: '默认配置',
				description:
					'使用编译器的默认配置运行bridge.编译器，该配置位于项目的“config.json”文件中。',
			},
		},
		extensions: {
			name: '扩展',
		},

		notifications: {
			socials: {
				message: '社交媒体',
			},
			gettingStarted: {
				message: '新手入门',
			},
			installApp: {
				message: '安装应用',
			},
			updateAvailable: {
				message: '可用更新',
			},
			updateExtensions: '更新全部扩展',
		},
	},
	// Welcome Screen
	welcome: {
		title: '欢迎来到bridge.',
		subtitle: '创建Minecraft附加包从未有如此便捷！',
		quickActions: '快速操作',
		recentFiles: '最近文件',
		recentProjects: '最近项目',
	},
	// Experimental gameplay toggles
	experimentalGameplay: {
		cavesAndCliffs: {
			name: '洞穴与山崖',
			description: '为生物群系内的新一代山峰内容启用自动补全。',
		},
		holidayCreatorFeatures: {
			name: '假日创作者功能',
			description: '为数据驱动的物品和方块功能启用自动补全。',
		},
		creationOfCustomBiomes: {
			name: '自定义生物群系的创建',
			description: '允许创建自定义生物群系、地物和地物规则。',
		},
		additionalModdingCapabilities: {
			name: '其他修改功能‌',
			description:
				'在清单中启用脚本API，并允许你创建脚本时使用自动补全。',
		},
		upcomingCreatorFeatures: {
			name: '即将推出的创作者功能‌',
			description: '启用迷雾功能域文件的创建并提供实体属性的自动补全。',
		},
		enableGameTestFramework: {
			name: '启用GameTest框架‌',
			description:
				'在清单中启用GameTest相关模块，并允许你创建GameTest脚本时使用自动补全。',
		},
		experimentalMolangFeatures: {
			name: '实验Molang功能‌',
			description: '为实验性Molang查询启用自动补全。',
		},
		educationEdition: {
			name: '启用教育版',
			description: '启用教育版功能的自动补全，例如材料分解器配方。',
		},
	},
	// Windows
	windows: {
		changelogWindow: {
			title: '有何新内容？',
		},
		openFile: {
			title: '打开',
			search: '搜索文件...',
			noData: '没有结果...',
		},
		createProject: {
			welcome: '欢迎来到bridge.！',
			welcomeDescription: '请创建你的第一个项目以开始使用。',
			omitPack: '忽略',
			selectedPack: '已选中',
			title: '创建项目',
			packIcon: '项目图标（可选）',
			projectName: {
				name: '项目名称',
				invalidLetters: '你只能使用字母和数字字符',
				mustNotBeEmpty: '你必须输入项目名称',
			},
			projectDescription: '项目描述（可选）',
			projectPrefix: '项目前缀',
			projectAuthor: '项目作者',
			projectTargetVersion: '项目目标版本',
			rpAsBpDependency: '将资源包注册为行为包依赖',
			bpAsRpDependency: '将行为包注册为资源包依赖',
			useLangForManifest: '将包的名称/描述直接添加到清单',
			create: 'Create',
			saveCurrentProject:
				'你想在创建新项目之前保存当前项目吗？任何未保存的更改都将丢失！',
			individualFiles: {
				name: '独立文件',
				file: {
					player: {
						name: 'player.json',
						description: '编辑默认玩家的行为方式',
					},
					tick: {
						name: 'tick.json',
						description: '定义哪些函数是每刻执行的',
					},
					skins: {
						name: 'skins.json',
						description: '注册你创建的皮肤',
					},
					blocks: {
						name: 'blocks.json',
						description: '用于定义方块的多个面如何组合为同一个方块',
					},
					terrainTexture: {
						name: 'terrain_texture.json',
						description: '用于为方块的面分配纹理',
					},
					itemTexture: {
						name: 'item_texture.json',
						description: '用于为物品分配纹理',
					},
					flipbookTextures: {
						name: 'flipbook_textures.json',
						description: '用于动态方块纹理',
					},
					biomesClient: {
						name: 'biomes_client.json',
						description: '用于定义生物群系特定效果的渲染方式',
					},
					sounds: {
						name: 'sounds.json',
						description: '用于定义特定游戏功能的声音',
					},
					soundDefinitions: {
						name: 'sound_definitions.json',
						description:
							'用于注册要在项目其他地方使用的音效文件的ID',
					},
				},
			},
		},
		createPreset: {
			title: '创建预设',
			searchPresets: '搜索预设...',
			overwriteFiles: '此预设会覆盖一个或多个现有文件。你要继续吗？',
			overwriteFilesConfirm: '继续',
			overwriteUnsavedChanges:
				'此预设会用未保存的更改覆盖一个或多个文件。你要继续吗？',
			overwriteUnsavedChangesConfirm: '继续',
			validationRule: {
				alphanumeric: '你只能使用字母、数字或下划线',
				lowercase: '你只能使用小写字母',
				required: '该字段是必需的',
				noEmptyFolderNames: '文件夹名称不能为空',
			},
		},
		deleteProject: {
			confirm: '删除',
			description: '你确定要删除此项目吗？',
		},
		socials: {
			title: '社交媒体',
			content:
				'查看我们的Twitter、Github并加入bridge.的官方Discord服务器！',
			discord: 'Discord',
			twitter: 'Twitter',
			github: 'Github',
		},
		projectChooser: {
			title: '选择项目',
			description: '选择当前活动的项目',
			searchProjects: '搜索项目...',
			newProject: {
				name: '新建项目',
				description: '创建一个新的bridge.项目。',
			},

			saveCurrentProject: {
				name: '保存项目',
				description:
					'将当前项目下载为.brproject文件以保存你所做的更改。',
			},
			openNewProject: {
				name: '打开项目',
				description: '通过选择相应的.brproject文件以打开另一个项目。',
				saveCurrentProject: '你想在加载新项目之前保存当前项目吗？',
			},
			wrongFileType: '项目必须是一个.brproject或.mcaddon文件',
			addPack: '添加包',
		},
		filePath: {
			title: '选择文件路径',
		},
		lootSimulatorSettings: {
			title: '模拟器设置',
			repeat: {
				name: '重复选项',
				amount: {
					name: '重复',
					description: '重复抓取战利品表一定次数',
				},
				itemFound: {
					name: '物品标识符',
					description:
						'运行战利品表，直到找到具有指定标识符的物品堆叠',
				},
				quantityFound: {
					name: '数量',
					description: '运行战利品表，直到找到具有指定的物品堆叠数量',
				},
			},
			killConditions: {
				looting: {
					name: '抢夺附魔',
					description: '用于运行表的抢夺级别，0表示没有抢夺',
				},
			},
		},
		packExplorer: {
			title: '包浏览器',
			searchFiles: '搜索文件...',
			categories: '类别',
			refresh: {
				name: '刷新项目',
				description: '为新添加的文件提取当前项目',
			},
			restartDevServer: {
				name: '重启开发服务器',
				description:
					'您确定要重新启动编译器的开发服务器吗？这可能需要一些时间，具体取决于项目的大小。重新启动编译器会从com.mojang文件夹中删除你的附加包，并基于你的bridge.文件夹将其重新编译！',
			},
			createPreset: '新建文件',
			projectConfig: {
				name: '打开项目配置',
				missing:
					'看起来这个项目没有config.json文件。每个项目都需要一个项目配置才能正常工作。',
			},
			exportAsMcaddon: {
				name: '导出为.mcaddon',
			},
			exportAsMctemplate: {
				name: '导出为.mctemplate',
				chooseWorld: '选择一个世界',
			},
			exportAsMcworld: {
				name: '导出为.mcworld',
				chooseWorld: '选择一个世界',
			},
			exportAsBrproject: {
				name: '导出为.brproject',
			},
			fileActions: {
				open: {
					name: '打开',
					description: '在编辑器中打开文件',
				},
				openInSplitScreen: {
					name: '在分屏中打开',
					description: '在分屏模式中打开文件',
				},
				delete: {
					name: '删除',
					description: '删除一个文件或文件夹',
					confirmText: '你确定要删除此文件吗？你之后将无法使其恢复！',
				},
				rename: {
					name: '重命名',
					description: '重命名一个文件',
				},
				duplicate: {
					name: '复制',
					description: '复制一个文件',
				},
				viewCompilerOutput: {
					name: '查看编译器输出',
					description: '查看该文件当前的编译器输出',
					fileMissing: '看起来该文件还未被编译。',
				},
				revealFilePath: {
					name: '显示文件路径',
					description: '显示文件或文件夹的位置',
				},
				createFile: {
					name: '创建文件',
					description: '创建一个新文件',
				},
				createFolder: {
					name: '创建文件夹',
					description: '创建一个新文件夹',
				},
				findInFolder: {
					name: '在文件夹中查找',
					description: '搜索文件夹中的内容',
				},
			},
		},
		settings: {
			title: '设置',
			searchSettings: '搜索设置...',
			sidebar: {
				name: '侧边栏',
				sidebarRight: {
					name: '侧边栏右置',
					description: '将侧边栏移动到屏幕右侧',
				},
				sidebarSize: {
					name: '侧边栏大小',
					description: '更改展开的侧边栏区域的宽度。',
				},
				shrinkSidebarElements: {
					name: '收缩侧边栏元素',
					description: '收缩bridge.的侧边栏元素的大小',
				},
			},
			appearance: {
				name: '外观',
				colorScheme: {
					name: '配色方案',
					description: '选择bridge.的UI的配色方案',
				},
				darkTheme: {
					name: '深色主题',
					description: '选择bridge.使用的深色默认主题',
				},
				lightTheme: {
					name: '浅色主题',
					description: '选择bridge.使用的浅色默认主题',
				},
				localDarkTheme: {
					name: '局部深色主题',
					description: '为当前活动的项目选择一个深色主题',
				},
				localLightTheme: {
					name: '局部浅色主题',
					description: '为当前活动的项目选择一个浅色主题',
				},
				fontSize: {
					name: '字体大小',
					description: '更改bridge.的文本的字体大小',
				},
				editorFontSize: {
					name: '代码字体大小',
					description: '更改bridge.的代码编辑器的字体大小',
				},
				editorFont: {
					name: '代码字体',
					description: '更改bridge.的代码编辑器的字体',
				},
				font: {
					name: '字体',
					description: '更改在bridge.的用户界面中使用的字体',
				},
			},
			general: {
				name: '常规',
				language: {
					name: '语言',
					description: '选择bridge.使用的语言',
				},
				collaborativeMode: {
					name: '协作模式',
					description:
						'在切换项目时强制完全刷新缓存。当你独自作业且只用bridge.来编辑你的项目时请禁用',
				},
				packSpider: {
					name: '包爬虫',
					description:
						'包爬虫能够为你项目中的文件建立连接，并在虚拟文件系统中向你展示这些连接',
				},
				formatOnSave: {
					name: '保存时格式化',
					description: '保存时自动格式化文本文件',
				},
				openLinksInBrowser: {
					name: '在默认浏览器中打开链接',
					description: '在默认浏览器而非本地应用程序窗口中打开链接',
				},
				restoreTabs: {
					name: '回复标签页',
					description:
						'在打开应用程序后恢复你上次使用bridge.时的标签页',
				},
				resetBridgeFolder: {
					name: '选择根文件夹',
					description: '选择bridge.操作的主文件夹',
				},
				openProjectChooserOnAppStartup: {
					name: '打开项目选择器',
					description: '启动bridge.时自动打开项目选择器',
				},
			},
			developer: {
				name: '开发者',
				simulateOS: {
					name: '模拟操作系统',
					description: '模拟不同的操作系统以测试平台特定的行为',
				},
				devMode: {
					name: '开发者模式',
					description: '为这个应用启用开发者模式',
				},
			},
			audio: {
				name: '音频',
				volume: {
					name: '启用音频',
					description: '启用或禁用所有bridge.音效',
				},
			},
			actions: {
				name: '操作',
			},
			projects: {
				name: '项目',
				defaultAuthor: {
					name: '默认作者',
					description: '新项目的默认作者',
				},
			},
			editor: {
				jsonEditor: {
					name: 'JSON编辑器',
					description: '选择编辑JSON文件的方式',
				},
				bridgePredictions: {
					name: 'bridge.预测',
					description:
						'启用bridge.预测可以让应用程序智能地决定是否在bridge.的树状编辑器中添加值或对象。这可以显著简化JSON编辑',
				},
				bracketPairColorization: {
					name: '括号对着色',
					description: '为匹配的括号给予独一的颜色',
				},
				wordWrap: {
					name: '自动换行',
					description: '使文字换行以禁用水平滚动',
				},
				wordWrapColumns: {
					name: '自动换行列数',
					description: '定义编辑器应该在多少列之后换行',
				},
				compactTabDesign: {
					name: '紧凑标签页设计',
					description: '以更紧凑的方式显示标签页系统内部的标签页',
				},
				automaticallyOpenTreeNodes: {
					name: '自动打开树状节点',
					description:
						'在bridge.的树状编辑器中，选择节点时会自动打开它们',
				},
				dragAndDropTreeNodes: {
					name: '拖放树状节点',
					description: '禁用/启用bridge.的树状编辑器中树状节点的拖放',
				},
			},
		},
		projectFolder: {
			title: '项目文件夹',
			content: 'bridge.需要访问其项目文件夹才能正常工作。',
		},
		extensionStore: {
			title: '扩展商店',
			searchExtensions: '搜索扩展...',
			deleteExtension: '删除扩展',
			activateExtension: '激活扩展',
			deactivateExtension: '停用扩展',
			offlineError: '无法加载扩展。请确认你的设备具有可用的网络连接。',
			compilerPluginDownload: {
				compilerPlugins: '编译器插件',
				title: '下载编译器插件',
				description:
					'你刚刚下载了一个新的编译器插件。请确保将其添加到你的编译器配置文件中，否则它不会有任何效果。',
				openConfig: '打开配置',
			},
		},
		pluginInstallLocation: {
			title: '选择安装位置',
		},
		unsavedFile: {
			description: '你想在关闭之前保存对该文件的更改吗？',
			save: '保存并关闭',
		},
		browserUnsupported: {
			title: '不支持的浏览器',
			description:
				'请使用Chrome（桌面版，除了Chrome 93或94）或Edge（Chromium版）以获得使用bridge. v2的最佳体验！你的浏览器不支持直接保存文件以及将项目同步到你的com.mojang文件夹的功能。',
			continue: '依旧继续',
		},
		invalidJson: {
			title: '无效的JSON',
			description:
				'bridge.的树状编辑器无法打开包含无效JSON 的文件。你可以在设置中切换到“原始文本”编辑器类型以手动修复问题。',
		},
		loadingWindow: {
			titles: {
				loading: '正在加载...',
			},
		},
	},
	taskManager: {
		tasks: {
			packIndexing: {
				title: '正在为包添加索引',
				description:
					'bridge.正在收集所需的数据，以便为你的包添加智能功能',
			},
			compiler: {
				title: '正在编辑项目',
				description:
					'bridge.正在编译你的项目，为其导入Minecraft做好准备',
			},
			unzipper: {
				name: '正在解压ZIP',
				description: 'bridge.当前正在解压一个ZIP文件。',
			},
			loadingSchemas: {
				name: '加载自动补全',
				description: 'bridge.当前正在加载其自动补全数据。',
			},
		},
	},
	fileDropper: {
		importFiles: '将文件拖放到此处以导入它们！',
		importFailed: 'bridge.无法导入以下文件：',
		andMore: '...和其他更多文件！',
		importMethod: '导入方法',
		saveToProject: {
			title: '保存至项目',
			description1: '在项目中保存',
			description2: '文件。',
		},
		openFile: {
			title: '打开文件',
			description1: '打开',
			description2: '文件并将编辑保存到原始文件。',
		},
	},
	comMojang: {
		folderDropped: '你想将此文件夹设置为默认的com.mojang文件夹吗？',
		title: '访问文件夹“com.mojang”',
		permissionRequest:
			'bridge.需要访问你的“com.mojang”文件夹才能将项目编译到其中。',
		status: {
			sucess: '已正确设置你的项目与com.mojang的同步。',
			deniedPermission:
				'你设置了与com.mojang的同步，但你没有授予bridge.访问文件夹的权限。',
			notSetup: '你尚未设置与com.mojang的同步。',
			notAvailable:
				'将项目同步到com.mojang文件夹的功能仅适用于使用Chrome和Edge的用户。',
		},
	},
	findAndReplace: {
		name: '查找和替换',
		search: '搜索',
		replace: '替换',
		replaceAll: '替换全部',
		includeFiles: '要包含的文件',
		excludeFiles: '要排除的文件',
		noResults: '未找到结果。',
		noSearch: '开始输入后，搜索查询的结果将显示在此处。',
	},
	preview: {
		name: '预览',
		viewAnimation: '查看动画',
		viewModel: '查看模型',
		viewParticle: '查看粒子',
		viewEntity: '查看实体',
		viewBlock: '查看方块',
		simulateLoot: '模拟战利品抢夺',
		failedClientEntityLoad: '无法加载所连接的客户端实体',
		invalidEntity:
			'无法为具有无效JSON的实体打开预览。请修复文件中的JSON错误，然后重试。',
		chooseGeometry: '选择几何',
		noGeometry:
			'在此文件中找不到有效的几何。确保您的JSON有效、文件结构正确且具有所提供标识符的几何存在。',
		lootTableSimulator: {
			emptyLootOutput: '输出为空，尝试运行战利品表以收集结果。',
			data: {
				value: '数据值',
				enchantments: '魔咒',
				blockStates: '方块状态',
				itemAuxValue: '附加值',
				eggIdentifier: '生成实体',
				bannerType: '旗帜类型',
				bookData: {
					view: '查看方块',
					title: '标题',
					author: '作者',
				},
				durability: '耐久',
				lore: '详细信息',
				displayName: '显示名称',
				mapDestination: '地图目的地',
			},
		},
	},
	initialSetup: {
		welcome: '欢迎来到bridge. v2！',
		welcomeCaption: '为Minecraft附加包打造的强大IDE',
		step: {
			installApp: {
				name: '安装bridge.',
				description:
					'为获得最佳体验，请安装bridge. v2作为你计算机的应用程序。',
			},
			bridge: {
				name: 'bridge.文件夹',
				description:
					'请创建一个文件夹，用于bridge.保存应用程序相关数据和你的附加包项目。',
			},
			bridgeProject: {
				name: 'bridge.项目',
				description:
					'你是要创建新项目还是从.brproject文件导入现有项目？',
				createNew: {
					name: '新建项目',
					description: '创建一个新项目。',
				},
				importExisting: {
					name: '导入项目',
					description: '导入一个现有项目。',
				},
			},
			comMojang: {
				name: 'com.mojang文件夹',
				description:
					'现在可以将你的com.mojang文件夹拖到bridge.上以设置项目到该文件夹的同步。这可以使Minecraft的Windows 10版本自动访问你的附加包。你也可以在后续使用bridge.过程中的任何时间完成设置与com.mojang的同步。',
				extraDescription: '将你的com.mojang文件夹拖到bridge.上',
			},
			editorType: {
				name: '选择编辑器类型',
				description:
					'你想如何编辑JSON文件？你可以稍后在bridge.的设置中更改你的选择！',
				rawText: {
					name: '原始文本',
					description:
						'以原始文本的形式编辑JSON，中、高级开发者的理想选择。带有高级自动补全和JSON验证功能。',
				},
				treeEditor: {
					name: '树状编辑器',
					description:
						'以树状结构的形式编辑JSON，几乎不需要JSON相关知识。非常适合初学者和中级创作者',
				},
			},
		},
	},
	editors: {
		treeEditor: {
			addObject: '添加对象',
			add: '添加',
			addArray: '添加数组',
			addValue: '添加值',
			forceValue: '强制值',
			edit: '编辑',
		},
	},
	functionValidator: {
		actionName: '验证函数',
		tabName: '函数验证器',
		errors: {
			emptyComplexConstructor: '意外的空的复杂选择器！',
			invalidSelectorAttribute: {
				part1: '无效的选择器特性‘',
				part2: '’！',
			},
			expectedEqualsButNothing: '预期的等号但所得为空！',
			expectedEquals: '预期的等号！',
			expectedValueButNothing: '预期的值但所得为空！',
			attributeNegationSupport: {
				part1: '特性‘',
				part2: '’不支持否定！',
			},
			multipleInstancesNever: {
				part1: '不允许出现特性‘',
				part2: '’的多个实例！',
			},
			multipleInstancesNegated: {
				part1: '在否定时不允许出现特性‘',
				part2: '’的多个实例！',
			},
			selectorAttributeTypeMismatch: {
				part1: '预期的值类型‘',
				part2: '’，但所得为‘',
				part3: '’！',
			},
			selectorValueNotValid: {
				part1: '值‘',
				part2: '’不是预期值之一！',
			},
			expectedComma: '选择器特性之间需要逗号！',
			unclosedString: '未闭合的字符串！',
			invalidCommand: {
				part1: '‘',
				part2: '’不是一个有效的命令！',
			},
			expectedLetterAfterAtButNothing: '在@之后出现了预期的的字母！',
			expectedLetterAfterAt: '在@之后出现了预期的的字母！',
			invalidSelector: {
				part1: '‘@',
				part2: '’不是一个有效的选择器！',
			},
			unexpectedOpenSquareBracket: '意外的‘[’！',
			selectorNotBeforeOpenSquareBracketButNothing:
				'在‘[’之前出现了预期的选择器，或得到了一个无效的方块状态！',
			selectorNotBeforeOpenSquareBracket:
				'在‘[’之前出现了预期的选择器，或得到了一个无效的方块状态！',
			unexpectedCloseSquareBracket: '意外的‘]’！',
			noValidCommandVarsFound: {
				part1: '找不到有效的命令变体！参数‘',
				part2: '’可能无效！它的类型是‘',
				part3: '’，但当前的变体树不支持该类型。',
			},
			noValidCommandVarsFoundEnd: {
				part1: '找不到有效的命令变体！您可能遗漏了一些参数或参数‘',
				part2: '’可能无效！',
			},
		},
		warnings: {
			schemaFamily: {
				part1: '找不到父族‘',
				part2: '’。这可能是一个错误，或者该父族来自另一个附加包。',
			},
			schemaType: {
				part1: '找不到类型‘',
				part2: '’。这可能是一个错误，或者该类型来自另一个附加包。',
			},
			schemaTag: {
				part1: '找不到标签‘',
				part2: '’。这可能是一个错误，或者该标签来自另一个附加包。',
			},
			schemaValue: {
				part1: '找不到模式值‘',
				part2: '’。这可能是一个错误，或者该模式值来自另一个附加包。',
			},
		},
	},
}

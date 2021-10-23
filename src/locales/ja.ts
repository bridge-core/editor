import { ja } from 'vuetify/src/locale'

export default {
	...ja,
	languageName: '日本語',
	// Common translations - should help stop unnecessarily repeating keys
	general: {
		yes: 'はい',
		no: 'いいえ',
		okay: 'わかりました',
		confirm: '確認',
		cancel: 'キャンセル',
		close: '閉じる',
		reload: '再読み込み',
		information: 'インフォメーション',
		continue: '続行',
		delete: '削除',
		select: '選択',
		skip: 'スキップ',
		save: '保存',
		more: 'More...',
		selectFolder: 'フォルダを選択',
		fileName: 'ファイル名',
		inactive: '非アクティブ',
		active: 'アクティブ',
		later: 'あとで',

		confirmOverwriteFile:
			'このアクションは、同名のファイルを上書きします。続行しますか？',
		fileSystemPolyfill:
			'お使いのブラウザは、進捗状況を保存するためにプロジェクトをダウンロードする必要があります。ChromeやEdgeを使用している場合は、その必要はありません。',
		successfulExport: {
			title: 'エクスポート成功',
			description:
				'エクスポートされたパッケージはこちらでご覧いただけます。',
		},
		experimentalGameplay: '試験的ゲームプレイ',
		textureLocation: 'テクスチャの場所',
	},
	packType: {
		behaviorPack: {
			name: 'ビヘイビアパック',
			description:
				'新しいゲームの仕組みを作り、Minecraftの動作を変えます',
		},
		resourcePack: {
			name: 'リソースパック',
			description: 'マインクラフトの外観やサウンドの変更します',
		},
		skinPack: {
			name: 'スキンパック',
			description:
				'プレイヤーが選択できるキャラクターの新たなスキンを提供します',
		},
		worldTemplate: {
			name: 'ワールドテンプレート',
			description:
				'ユーザーがプロジェクトを体験するためのワールドを作成します',
		},
	},
	// File Type display names
	fileType: {
		manifest: 'マニフェスト',
		animation: 'アニメーション',
		animationController: 'アニメーションコントローラ',
		biome: 'バイオーム',
		block: 'ブロック',
		bridgeConfig: 'プロジェクト設定',
		dialogue: 'ダイアログ',
		entity: 'エンティティ',
		feature: 'フィーチャー',
		featureRule: 'フィーチャールール',
		functionTick: 'ファンクションティック',
		function: 'ファンクション',
		item: 'アイテム',
		lootTable: 'ルートテーブル',
		recipe: 'レシピ',
		clientScript: 'クライアントスクリプト',
		serverScript: 'サーバースクリプト',
		script: 'スクリプト',
		spawnRule: 'スポーンルール',
		mcstructure: 'ストラクチャー',
		tradeTable: 'トレードテーブル',
		clientManifest: 'クライアントマニフェスト',
		skinManifest: 'スキンマニフェスト',
		geometry: 'ジオメトリ',
		customCommand: 'コマンド',
		customComponent: 'コンポーネント',
		clientAnimation: 'クライアントアニメーション',
		clientAnimationController: 'クライアントアニメーションコントローラ',
		attachable: 'アタッチャブル',
		clientEntity: 'クライアントエンティティ',
		clientItem: 'クライアントアイテム',
		clientLang: '言語',
		fog: 'フォグ',
		particle: 'パーティクル',
		renderController: 'レンダーコントローラ',
		texture: 'テクスチャ',
		textureSet: 'テクスチャセット',
		itemTexture: 'アイテムテクスチャ',
		clientBlock: 'クライアントブロック',
		terrainTexture: 'Terrain テクスチャ',
		flipbookTexture: 'Flipbook テクスチャ',
		clientBiome: 'クライアントバイオーム',
		soundDefinition: 'サウンド定義',
		musicDefinition: '音楽定義',
		clientSound: 'クライアントサウンド',
		skins: 'スキン',
		langDef: '言語定義',
		lang: '言語',
		molang: 'Molang',
		gameTest: 'Game Test',
		unknown: 'その他',
		simpleFile: 'シンプルファイル',
		ui: 'UI',
		volume: 'ボリューム',
		worldManifest: 'ワールドマニフェスト',
	},
	// Actions
	actions: {
		newProject: {
			name: '新規プロジェクト',
			description: '新規 bridge. プロジェクトを作成します',
		},
		newFile: {
			name: '新規ファイル',
			description: '新しいアドオン機能の作成',
		},
		openFile: {
			name: 'ファイルを開く',
			description: '現在のプロジェクトからファイルを開く',
		},
		searchFile: {
			name: 'ファイルを探す',
			description: '現在のプロジェクトからファイルを検索して開く',
		},
		saveFile: {
			name: 'ファイルを保存',
			description: '現在開いているファイルを保存する',
		},
		saveAs: {
			name: '名前を付けて保存...',
			description: '現在開いているファイルを別の名前で保存する',
		},
		saveAll: {
			name: 'すべて保存',
			description: '現在開いているファイルをすべて保存',
		},
		closeFile: {
			name: 'ファイルを閉じる',
			description: '現在開いているファイルを閉じる',
		},
		settings: {
			name: '設定',
			description: 'bridge. のアプリ設定を開く',
		},
		extensions: {
			name: '拡張機能',
			description: '拡張機能のインストールと管理',
		},
		copy: {
			name: 'コピー',
			description: '選択したテキストをクリップボードにコピー',
		},
		cut: {
			name: '切り取り',
			description: '選択したテキストをクリップボードにコピーし、切り取る',
		},
		paste: {
			name: '貼り付け',
			description: 'クリップボードの内容を貼り付ける',
		},
		docs: {
			name: 'ドキュメント',
			description: 'Minecraft アドオンのドキュメントを開く',
		},
		releases: {
			name: 'リリース',
			description: '最新の bridge. リリースを見る',
		},
		bugReports: {
			name: 'バグレポート',
			description: 'bridge. の問題を報告する',
		},
		extensionAPI: {
			name: '拡張機能 API',
			description: 'bridge. の拡張機能 API について詳しくはこちら',
		},
		gettingStarted: {
			name: 'はじめに',
			description: 'ブリッジを使い始めるためのガイドを読む',
		},
		faq: {
			name: 'FAQ',
			description: 'ブリッジでのアドオン開発に関するよくある質問',
		},
		reloadAutoCompletions: {
			name: 'オートコンプリートの再読み込み',
			description: 'すべてのオートコンプリートデータを再読み込みする',
		},
		reloadExtensions: {
			name: '拡張機能の再読み込み',
			description: 'すべての拡張機能を再読み込みする',
		},
		moveToSplitScreen: {
			name: '分割画面へ移動',
			description: '分割画面を開き、このタブを移す',
		},
		closeTab: {
			name: 'タブを閉じる',
			description: 'このタブを閉じる',
		},
		closeAll: {
			name: 'すべて閉じる',
			description: 'すべてのタブを閉じる',
		},
		closeTabsToRight: {
			name: '右側を閉じる',
			description: 'このタブの右側にあるすべてのタブを閉じる',
		},
		closeAllSaved: {
			name: '保存済みを閉じる',
			description: '保存したタブをすべて閉じる',
		},
		closeOtherTabs: {
			name: 'その他を閉じる',
			description: 'このタブ以外のすべてのタブを閉じる',
		},
		clearAllNotifications: {
			name: '全ての通知を消去',
			description: '現在表示されているすべての通知を消去する',
		},
		pluginInstallLocation: {
			global: {
				name: 'グローバルにインストール',
				description:
					'グローバル拡張機能は、すべてのプロジェクトでアクセス可能です',
			},
			local: {
				name: 'ローカルにインストール',
				description:
					'ローカル拡張機能は、追加したプロジェクトの中でのみアクセス可能です',
			},
		},
		toObject: {
			name: 'オブジェクトに変換',
		},
		toArray: {
			name: '配列に変換',
		},
		documentationLookup: {
			name: 'ドキュメントの表示',
			noDocumentation: 'このドキュメントはありません: ',
		},
		toggleReadOnly: {
			name: '読み取り専用の切り替え',
			description:
				'現在開いているファイルの読み取り専用モードを切り替える',
		},
		keepInTabSystem: {
			name: 'タブを固定',
			description: 'タブを固定します',
		},
		importBrproject: {
			name: 'プロジェクトのインポート',
			description: '.brprojectファイルからプロジェクトをインポートする',
		},
		downloadFile: {
			name: 'ファイルをダウンロード',
			description: '現在開いているファイルをダウンロードする',
		},
		undo: {
			name: '元に戻す',
			description: '直前の操作を元に戻す',
		},
		redo: {
			name: 'やり直し',
			description: '直前の操作をやり直す',
		},
		goToDefinition: {
			name: '定義へ移動',
			description: '選択したシンボルの定義に移動',
		},
		goToSymbol: {
			name: 'シンボルへ移動',
			description: '移動するシンボルを選択するダイアログを開く',
		},
		formatDocument: {
			name: 'ドキュメントのフォーマット',
			description: '現在開いているドキュメントをフォーマットする',
		},
		changeAllOccurrences: {
			name: 'すべての出現個所を変更',
			description: '選択されたテキストのすべての出現箇所を変更する',
		},
	},
	// Toolbar Categories
	toolbar: {
		project: {
			name: 'プロジェクト',
		},
		file: {
			name: 'ファイル',
			preferences: {
				name: '設定',
			},
		},
		edit: {
			name: '編集',
		},
		tools: {
			name: 'ツール',
		},
		help: {
			name: 'ヘルプ',
		},
	},
	// Sidebar tabs
	sidebar: {
		compiler: {
			name: 'コンパイラ',
			default: {
				name: 'デフォルト設定',
				description:
					'プロジェクトの config.json ファイルに含まれるデフォルトのコンパイラー設定で bridge. のコンパイラーを実行します。',
			},
		},
		extensions: {
			name: '拡張機能',
		},

		notifications: {
			socials: {
				message: 'ソーシャル',
			},
			gettingStarted: {
				message: 'はじめに',
			},
			installApp: {
				message: 'アプリのインストール',
			},
			updateAvailable: {
				message: 'アップデート可能',
			},
			updateExtensions: 'すべての拡張機能をアップデート',
		},
	},
	// Welcome Screen
	welcome: {
		title: 'ようこそ bridge. へ',
		subtitle:
			'Minecraft のアドオンの作成が、これまで以上に便利になりました!',
		quickActions: 'クイックアクション',
		recentFiles: '最近のファイル',
		recentProjects: '最近のプロジェクト',
	},
	// Experimental gameplay toggles
	experimentalGameplay: {
		cavesAndCliffs: {
			name: 'Caves and Cliffs',
			description: '新しい山の生成に自動補完を有効にします。',
		},
		holidayCreatorFeatures: {
			name: 'ホリデークリエイターの特徴',
			description:
				'データ駆動型のアイテムおよびブロック機能の自動補完を有効にします。',
		},
		creationOfCustomBiomes: {
			name: 'オリジナルバイオームの作成',
			description:
				'カスタムバイオーム、フィーチャー、フィーチャールールの作成を可能にします。',
		},
		additionalModdingCapabilities: {
			name: '追加の改造機能',
			description:
				'マニフェストで Scripting API を有効にし、自動補完機能付きのスクリプトを作成できるようにします。',
		},
		upcomingCreatorFeatures: {
			name: '今後のクリエイター機能',
			description:
				'フォグボリュームファイルの作成を可能にし、エンティティプロパティの自動補完機能を提供します。',
		},
		enableGameTestFramework: {
			name: 'GameTestフレームワークの有効化',
			description:
				'マニフェストで GameTest 関連モジュールを有効にし、自動補完機能付きのGameTestスクリプトを作成できるようにします。',
		},
		experimentalMolangFeatures: {
			name: '実験的な Molang の機能',
			description:
				'実験的な Molang のクエリに対する自動補完機能を有効にします。',
		},
		educationEdition: {
			name: 'Education Edition の有効化',
			description:
				'物質還元レシピなどの教育機能で自動補完を有効にします。',
		},
	},
	// Windows
	windows: {
		changelogWindow: {
			title: "What's new?",
		},
		openFile: {
			title: '開く',
			search: 'ファイルの検索...',
			noData: '見つかりませんでした...',
		},
		createProject: {
			welcome: 'bridge. へようこそ!!',
			welcomeDescription:
				'まずは最初のプロジェクトを作成してみてください。',
			omitPack: '省略可',
			selectedPack: '選択済み',
			title: 'プロジェクトの作成',
			packIcon: 'プロジェクトアイコン（任意)',
			projectName: {
				name: 'プロジェクト名',
				invalidLetters: '使用できる文字は半角英数字のみです',
				mustNotBeEmpty: 'プロジェクト名を入力する必要があります',
			},
			projectDescription: 'プロジェクトの説明（任意)',
			projectPrefix: 'プロジェクト名',
			projectAuthor: 'プロジェクト作成者',
			projectTargetVersion: 'プロジェクトターゲットバージョン',
			rpAsBpDependency:
				'リソースパックをビヘイビアパックの依存関係として登録する',
			bpAsRpDependency:
				'ビヘイビアパックをリソースパックの依存関係として登録する',
			useLangForManifest: 'マニフェストにパック名/説明文を直接追加する',
			create: '作成',
			saveCurrentProject:
				'新しいプロジェクトを作成する前に、現在のプロジェクトを保存しますか？保存されていない変更点は失われてしまいます',
			individualFiles: {
				name: '個別ファイル',
				file: {
					player: {
						name: 'player.json',
						description:
							'プレーヤーのデフォルトビヘイビアを定義します',
					},
					tick: {
						name: 'tick.json',
						description: 'ティック毎に実行する機能の定義をします',
					},
					skins: {
						name: 'skins.json',
						description: '作成したスキンの登録をします',
					},
					blocks: {
						name: 'blocks.json',
						description:
							'ブロックのテクスチャ/サウンドを1つにまとめて使用します',
					},
					terrainTexture: {
						name: 'terrain_texture.json',
						description:
							'ブロックの面にテクスチャーを割り当てるために使用します',
					},
					itemTexture: {
						name: 'item_texture.json',
						description:
							'アイテムにテクスチャーを割り当てるために使用します',
					},
					flipbookTextures: {
						name: 'flipbook_textures.json',
						description:
							'ブロックテクスチャーのアニメーションに使用',
					},
					biomesClient: {
						name: 'biomes_client.json',
						description:
							'バイオーム特有の効果がどのようにレンダリングされるかを定義するために使用します',
					},
					sounds: {
						name: 'sounds.json',
						description:
							'特定のゲーム機能のサウンドを定義するために使用します',
					},
					soundDefinitions: {
						name: 'sound_definitions.json',
						description:
							'プロジェクト内の他の場所で使用するサウンドファイルのIDを登録するために使用します。',
					},
				},
			},
		},
		createPreset: {
			title: 'プリセットの作成',
			searchPresets: 'プリセットを検索...',
			overwriteFiles:
				'このプリセットは、1つまたは複数の既存のファイルを上書きします。続行しますか？',
			overwriteFilesConfirm: '続行',
			overwriteUnsavedChanges:
				'このプリセットは、未保存の変更がある1つまたは複数のファイルを上書きします。続行しますか？',
			overwriteUnsavedChangesConfirm: '続行',
			validationRule: {
				alphanumeric: '使用できる文字は英数字とアンダースコアのみです',
				lowercase: '使用できる文字は小文字のみです',
				required: 'この項目は必須です',
				noEmptyFolderNames: 'フォルダ名を空にすることはできません',
			},
		},
		deleteProject: {
			confirm: '削除',
			description: 'このプロジェクトを削除してもよろしいですか？',
		},
		socials: {
			title: 'ソーシャル',
			content:
				'Twitter, Github をチェックして、 bridge. 公式のDiscordサーバーに参加してください！',
			discord: 'Discord',
			twitter: 'Twitter',
			github: 'Github',
		},
		projectChooser: {
			title: 'プロジェクトを選択',
			description: '現在アクティブなプロジェクトを選択します',
			searchProjects: 'プロジェクトの検索...',
			newProject: {
				name: '新規プロジェクト',
				description: '新しい bridge. プロジェクトを作成します。',
			},

			saveCurrentProject: {
				name: 'プロジェクトの保存',
				description:
					'現在のプロジェクトを .brproject ファイルとしてダウンロードし、行った変更を保存することができます。',
			},
			openNewProject: {
				name: 'プロジェクトを開く',
				description:
					' .brproject ファイルを選択して、プロジェクトを開きます。',
				saveCurrentProject:
					'新しいプロジェクトを読み込む前に、現在のプロジェクトを保存しますか？',
			},
			wrongFileType:
				'プロジェクトは、 .brproject または .mcaddon ファイルでなければなりません。',
			addPack: 'パックの追加',
		},
		filePath: {
			title: 'ファイルパスの選択',
		},
		packExplorer: {
			title: 'パックエクスプローラー',
			searchFiles: 'ファイルの検索...',
			categories: 'カテゴリー',
			refresh: {
				name: 'プロジェクトの再読み込み',
				description:
					'新しく追加されたファイルのために、現在のプロジェクトを再読み込みする',
			},
			restartDevServer: {
				name: '開発サーバーの再起動',
				description:
					'コンパイラの開発サーバーを再起動してもよろしいですか？プロジェクトの規模によっては時間がかかる場合があります。',
			},
			createPreset: '新規ファイル',
			projectConfig: {
				name: 'プロジェクト設定を開く',
				missing:
					'このプロジェクトには、config.jsonファイルがないように見えます。すべてのプロジェクトが正常に動作するためには、プロジェクトのコンフィグファイルが必要です。',
			},
			exportAsMcaddon: {
				name: '.mcaddon としてエクスポート',
			},
			exportAsMctemplate: {
				name: '.mctemplate としてエクスポート',
				chooseWorld: 'ワールドを選択',
			},
			exportAsMcworld: {
				name: '.mcworld としてエクスポート',
				chooseWorld: 'ワールドを選択',
			},
			exportAsBrproject: {
				name: '.brproject としてエクスポート',
			},
			fileActions: {
				delete: {
					name: '削除',
					description: 'ファイルやフォルダーの削除',
					confirmText:
						'本当に削除しますか?後からファイルを復元することはできません',
				},
				rename: {
					name: '名前の変更',
					description: 'ファイル名の変更',
				},
				duplicate: {
					name: '複製',
					description: 'ファイルを複製する',
				},
				viewCompilerOutput: {
					name: 'コンパイラの出力表示',
					description: 'このファイルのコンパイラ出力を表示する',
					fileMissing:
						'このファイルはまだコンパイルされていないようです',
				},
				revealFilePath: {
					name: 'ファイルパスの表示',
					description: 'ファイルやフォルダーのパスを表示する',
				},
				createFile: {
					name: '新しいファイル',
					description: '新規ファイル作成',
				},
				createFolder: {
					name: '新しいフォルダ',
					description: '新規フォルダ作成',
				},
			},
		},
		settings: {
			title: '設定',
			searchSettings: '設定の検索...',
			sidebar: {
				name: 'サイドバー',
				sidebarRight: {
					name: 'サイドバーを右側へ',
					description: 'サイドバーを画面の右側に移動します',
				},
				sidebarSize: {
					name: 'サイドバーの大きさ',
					description: '展開されたサイドバー領域の幅を変更します',
				},
				shrinkSidebarElements: {
					name: 'サイドバー要素を縮小する',
					description: 'bridge.のサイドバー要素のサイズを縮小します',
				},
			},
			appearance: {
				name: '外観',
				colorScheme: {
					name: '配色',
					description: 'bridge. のUI配色を設定します',
				},
				darkTheme: {
					name: 'ダークテーマ',
					description:
						'bridge. が使用するデフォルトのダークテーマを選択します',
				},
				lightTheme: {
					name: 'ライトテーマ',
					description:
						'bridge. が使用するデフォルトのライトテーマを選択します',
				},
				localDarkTheme: {
					name: 'ローカルダークテーマ',
					description:
						'現在アクティブなプロジェクトのダークテーマを選択します',
				},
				localLightTheme: {
					name: 'ローカルライトテーマ',
					description:
						'現在アクティブなプロジェクトのライトテーマを選択します',
				},
				fontSize: {
					name: 'フォントサイズ',
					description: 'bridge. の文字サイズを変更します',
				},
				editorFontSize: {
					name: 'コードフォントサイズ',
					description:
						'bridge. のコードエディタのフォントサイズを変更します',
				},
				editorFont: {
					name: 'コードフォント',
					description:
						'bridge. のコードエディタのフォントを変更します',
				},
				font: {
					name: 'フォント',
					description:
						'bridge. のユーザーインターフェース内で使用されているフォントを変更します',
				},
			},
			general: {
				name: '一般',
				language: {
					name: '言語',
					description: 'bridge. が使用する言語を選択します',
				},
				collaborativeMode: {
					name: 'コラボレーションモード',
					description:
						'プロジェクトの切り替え時に、キャッシュを強制的に再読み込みします。一人で作業していて、プロジェクトの編集にのみ bridge. を使用する場合は無効にします。',
				},
				packSpider: {
					name: 'Pack Spider',
					description:
						'Pack Spider は、プロジェクト内のファイルを接続し、その接続を仮想ファイルシステムで表示します。',
				},
				formatOnSave: {
					name: '保存時のフォーマット',
					description:
						'テキストファイルの保存時にフォーマットを行います',
				},
				openLinksInBrowser: {
					name: 'リンクをデフォルトのブラウザで開く',
					description:
						'ネイティブアプリのウィンドウではなく、デフォルトのブラウザでリンクを開きます',
				},
				restoreTabs: {
					name: 'タブの復元',
					description:
						'アプリを起動すると、前回 bridge. を使用したときのタブが復元されます。',
				},
				resetBridgeFolder: {
					name: 'ルートフォルダの選択',
					description: 'bridge. が動作するメインフォルダを選択します',
				},
				openProjectChooserOnAppStartup: {
					name: 'プロジェクトを選択を開く',
					description:
						'ブリッジの起動時に自動的に「プロジェクトを選択」を開くようにします。',
				},
			},
			developer: {
				name: '開発者',
				simulateOS: {
					name: 'OSシミュレート',
					description:
						'異なるOSをシミュレートしてプラットフォーム固有の動作をテストします',
				},
				devMode: {
					name: '開発者モード',
					description: 'このアプリの開発者モードを有効にします',
				},
			},
			audio: {
				name: 'オーディオ',
				volume: {
					name: 'オーディオの有効化',
					description:
						'すべてのbridge. サウンドを有効または無効にします',
				},
			},
			actions: {
				name: 'アクション',
			},
			projects: {
				name: 'プロジェクト',
				defaultAuthor: {
					name: 'デフォルトの著者',
					description:
						'新しいプロジェクトのデフォルトの著者を設定します',
				},
			},
			editor: {
				name: 'エディタ',
				jsonEditor: {
					name: 'JSONエディタ',
					description: 'JSONファイルの編集方法を選択します',
				},
				bracketPairColorization: {
					name: 'ブラケットペアのカラーリング',
					description: '対になっているブラケットに色をつけます',
				},
				wordWrap: {
					name: 'ワードラップ',
					description:
						'水平方向のスクロールを無効にするために単語を折り返します',
				},
				wordWrapColumns: {
					name: '折り返し文字数',
					description: 'エディタが何文字目で折り返すか設定します',
				},
				compactTabDesign: {
					name: 'コンパクトなタブ',
					description: 'タブをよりコンパクトに表示します',
				},
				automaticallyOpenTreeNodes: {
					name: 'ツリーのノードを自動的に開く',
					description:
						'bridge. のツリーエディタで、ノードを選択すると自動的にノードを開きます',
				},
				dragAndDropTreeNodes: {
					name: 'ツリーノードのドラッグ＆ドロップ',
					description:
						'bridge.のツリーエディタ内でのツリーノードのドラッグ＆ドロップを有効または無効にします',
				},
			},
		},
		projectFolder: {
			title: 'プロジェクトフォルダ',
			content:
				'bridge. が正常に動作するためには、プロジェクトフォルダにアクセスする必要があります。',
		},
		extensionStore: {
			title: '拡張機能ストア',
			searchExtensions: '拡張機能を検索...',
			deleteExtension: '拡張機能を削除',
			activateExtension: '拡張機能の有効化',
			deactivateExtension: '拡張機能の無効化',
			offlineError:
				'拡張機能の読み込みに失敗しました。お使いの機器がネットワークに接続されていることを確認してください。',
			compilerPluginDownload: {
				compilerPlugins: 'コンパイラープラグイン',
				title: 'コンパイラープラグインをダウンロード',
				description:
					'新しいコンパイラープラグインをダウンロードしました。コンパイラコンフィグファイルにこのプラグインを追加してください。',
				openConfig: 'コンフィグを開く',
			},
		},
		pluginInstallLocation: {
			title: 'インストール先の選択',
		},
		unsavedFile: {
			description: 'このファイルを閉じる前に、変更内容を保存しますか？',
			save: '保存して閉じる',
		},
		browserUnsupported: {
			title: '未対応のブラウザ',
			description:
				'bridge. v2 をより快適にご利用いただくために、 Chrome（Desktop） または Edge（Chromium） をご利用ください。お使いのブラウザは、ファイルを直接保存したり、プロジェクトをcom.mojangフォルダに同期することをサポートしていません。',
			continue: '了解した上で続ける',
		},
		invalidJson: {
			title: '無効な JSON',
			description:
				'bridge. のツリーエディタで、無効な JSON ファイルを開くことができません。この問題を解決するには、設定で JSON エディタタイプを「Raw Text」に切り替えて、手動で修正してください。',
		},
		loadingWindow: {
			titles: {
				loading: '読み込み中...',
			},
		},
	},
	taskManager: {
		tasks: {
			packIndexing: {
				title: 'パックのインデックス作成中',
				description:
					'bridge. はインテリジェント機能に必要なパックのデータを収集しています',
			},
			compiler: {
				title: 'プロジェクトのコンパイル中',
				description:
					'bridge. は Minecraft にインポートできるようにプロジェクトをコンパイルしています',
			},
			unzipper: {
				name: 'ZIPの解凍中',
				description: 'bridge. は ZIP ファイルを解凍しています',
			},
			loadingSchemas: {
				name: 'オートコンプリートの読み込み中',
				description: 'bridge. の自動補完データを読み込んでいます',
			},
		},
	},
	fileDropper: {
		importFiles: 'ファイルをドロップすると、インポートされます!',
		importFailed:
			'bridge. は、ファイルをインポートすることができませんでした',
		andMore: '...and more!',
		importMethod: 'インポート方法',
		saveToProject: {
			title: 'プロジェクトへの保存',
			description1: '',
			description2: 'をプロジェクト内に保存します',
		},
		openFile: {
			title: 'ファイルを開く',
			description1: '',
			description2: 'を開き、編集した内容を元のファイルに保存します',
		},
	},
	comMojang: {
		folderDropped:
			'このフォルダをデフォルトの com.mojang フォルダとして設定しますか？',
		title: '"com.mojang"フォルダへのアクセス',
		permissionRequest:
			'プロジェクトをコンパイルするには "com.mojang" フォルダにアクセスする必要があります',
		status: {
			sucess:
				'com.mojang へのプロジェクトの同期設定は正しく設定されています。',
			deniedPermission:
				'com.mojang への同期設定をしましたが、フォルダにbridge. の権限が与えられていません',
			notSetup: 'com.mojang への同期設定をまだ設定していません。',
			notAvailable:
				'プロジェクトを com.mojang フォルダに同期する機能は、 Chrome と Edge ユーザーのみ利用可能です。',
		},
	},
	findAndReplace: {
		name: '検索と置換',
		search: '検索',
		replace: '置換',
		replaceAll: 'すべて置換',
		noResults: '該当する結果はありませんでした',
		noSearch: '入力を開始すると、検索クエリの結果がここに表示されます。',
	},
	preview: {
		name: 'プレビュー',
		viewAnimation: 'アニメーションの表示',
		viewModel: 'モデルの表示',
		viewParticle: 'パーティクルの表示',
		viewEntity: 'エンティティの表示',
		viewBlock: 'ブロックの表示',
		failedClientEntityLoad:
			'接続されているクライアントエンティティの読み込みに失敗しました',
		invalidEntity:
			'無効な JSON を持つエンティティのプレビューを開くことができません。ファイル内の JSON エラーを修正してから再度お試しください。',
		chooseGeometry: 'ジオメトリの選択',
		noGeometry:
			'このファイル内に有効なジオメトリが見つかりません。 JSON が有効であること、ファイル構造が正しいこと、および指定された識別子を持つジオメトリが存在することを確認してください。',
	},
	initialSetup: {
		welcome: 'ようこそ、 bridge. v2 へ!',
		welcomeCaption: 'Minecraft アドオンのための強力な 統合開発環境',
		step: {
			installApp: {
				name: 'bridge. をインストール',
				description:
					'最高の体験をするためには、bridge. v2をアプリとしてコンピュータにインストールしてください。',
			},
			bridge: {
				name: 'bridge. フォルダ',
				description:
					'bridge. がアプリ関連のデータやアドオンのプロジェクトを保存できるフォルダを作成してください。',
			},
			bridgeProject: {
				name: 'bridge. プロジェクト',
				description:
					'新しいプロジェクトを作成したいですか？それとも既存のプロジェクトを .brproject ファイルからインポートしますか？',
				createNew: {
					name: '新規プロジェクト',
					description: '新規プロジェクトを作成します。',
				},
				importExisting: {
					name: 'プロジェクトのインポート',
					description: '既存のプロジェクトをインポートします。',
				},
			},
			comMojang: {
				name: 'com.mojang フォルダ',
				description:
					'com.mojang フォルダを bridge. にドラッグして、プロジェクトとの同期を設定します。これにより、 Minecraft for Windows 10 の中でアドオンに自動的にアクセスできるようになります。 com.mojang の同期設定は、 bridge. を開いている間はいつでも行えます。',
				extraDescription:
					'com.mojang フォルダを bridge. にドラッグします。',
			},
			editorType: {
				name: 'エディタータイプの選択',
				description:
					'JSON ファイルをどのように編集しますか？ あとで設定を変更することもできます。',
				rawText: {
					name: 'Raw Text',
					description:
						'JSONを生のテキストとして編集することができます。 中級から上級の開発者に最適です。 高度な自動補完機能とJSONの検証機能を備えています。',
				},
				treeEditor: {
					name: 'Tree Editor',
					description:
						'JSONの知識をほとんど必要とせずに、JSONをツリー状に編集します。 初心者や中級者のクリエイターに最適です。',
				},
			},
		},
	},
	editors: {
		treeEditor: {
			addObject: 'オブジェクトの追加',
			addArray: '配列の追加',
			addValue: '値の追加',
			edit: '編集',
		},
	},
}

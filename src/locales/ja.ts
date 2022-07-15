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
		more: 'もっと...',
		selectFolder: 'フォルダーを選択',
		fileName: 'ファイル名',
		folderName: 'フォルダー名',
		inactive: '無効',
		active: '有効',
		later: 'あとで',
		clear: 'クリア',
		reset: 'リセット',
		readMore: '続きを読む',

		confirmOverwriteFile:
			'このアクションは同名のファイルを上書きします。 続行しますか？',
		confirmOverwriteFolder:
			'このアクションは同名のフォルダを上書きします。 続行しますか？',
		fileSystemPolyfill:
			'お使いのブラウザは進捗状況を保存するためにプロジェクトをダウンロードする必要があります。 Chrome や Edge を使用している場合はその必要はありません。',
		successfulExport: {
			title: 'エクスポート成功',
			description:
				'エクスポートされたパッケージはこちらでご覧いただけます。',
		},
		experimentalGameplay: '実験的ゲームプレイ',
		textureLocation: 'テクスチャの場所',
	},
	packType: {
		behaviorPack: {
			name: 'ビヘイビアーパック',
			description:
				'新しいゲームの仕組みを作り Minecraft の動作を変えます',
		},
		resourcePack: {
			name: 'リソースパック',
			description: 'Minecraft の外観やサウンドの変更します',
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
		animationController: 'アニメーションコントローラー',
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
		clientAnimationController: 'クライアントアニメーションコントローラー',
		attachable: 'アタッチャブル',
		clientEntity: 'クライアントエンティティ',
		clientItem: 'クライアントアイテム',
		clientLang: '言語',
		fog: 'フォグ',
		particle: 'パーティクル',
		renderController: 'レンダーコントローラー',
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
			description: '選択したテキストをクリップボードにコピーして切り取る',
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
		twitter: {
			name: 'Twitter',
			description: 'Twitter で bridge. をフォローする',
		},
		extensionAPI: {
			name: '拡張機能 API',
			description: 'bridge. の拡張機能 API について詳しくはこちら',
		},
		gettingStarted: {
			name: 'はじめに',
			description: 'bridge. を使い始めるためのガイドを読む',
		},
		faq: {
			name: 'FAQ',
			description: 'bridge. でのアドオン開発に関するよくある質問',
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
			description: '分割画面を開きこのタブを移す',
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
			name: 'すべての通知を消去',
			description: '現在表示されているすべての通知を消去する',
		},
		pluginInstallLocation: {
			global: {
				name: 'グローバルにインストール',
				description: 'すべてのプロジェクトで利用可能にします',
			},
			local: {
				name: 'ローカルにインストール',
				description: '追加したプロジェクトの中でのみ利用可能にします',
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
			description: '.brproject ファイルからプロジェクトをインポートする',
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
		tgaMaskToggle: {
			name: 'Alphaチャンネルの切替',
		},
		recompileChanges: {
			name: '変更時にコンパイルする',
			description:
				'bridge. なしで編集されたすべてのファイルをコンパイルします ウォッチモードを無効にした後エディター自体で行われた変更はコンパイルされません',
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
			categories: {
				watchMode: {
					name: 'ウォッチモード',
					settings: {
						watchModeActive: {
							name: 'ウォッチモード',
							description:
								'ファイルに変更を行った際に再コンパイルするか切り替えます',
						},
						autoFetchChangedFiles: {
							name: '自動取得',
							description:
								'bridge. の起動時に変更されたファイルを検索します',
						},
					},
				},
				profiles: 'ビルドプロファイル',
				outputFolders: '出力先フォルダー',
				logs: {
					name: 'ログ',
					noLogs: 'ログはまだありません',
				},
			},
			default: {
				name: 'デフォルト設定',
				description:
					'プロジェクト設定(config.json)内にあるデフォルトのコンパイラ設定でコンパイルします',
			},
			actions: {
				runLastProfile: '最新のプロファイルを実行する',
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
		subtitle: 'Minecraft のアドオンの作成がこれまで以上に便利になりました!',
		quickActions: 'クイックアクション',
		recentFiles: '最近のファイル',
		recentProjects: '最近のプロジェクト',
	},
	// Experimental gameplay toggles
	experimentalGameplay: {
		cavesAndCliffs: {
			name: 'Caves and Cliffs',
			description: '新しいワールド生成用の自動補完機能を有効にします。',
		},
		holidayCreatorFeatures: {
			name: 'ホリデークリエイターの特徴',
			description:
				'データ駆動型のアイテムおよびブロックの自動補完機能を有効にします。',
		},
		creationOfCustomBiomes: {
			name: 'オリジナルバイオームの作成',
			description:
				'カスタムバイオーム、フィーチャー、フィーチャールールの作成を可能にします。',
		},
		additionalModdingCapabilities: {
			name: '追加の改造機能',
			description:
				'マニフェストの Scripting API とスクリプトの自動補完機能を有効化します。',
		},
		upcomingCreatorFeatures: {
			name: '今後のクリエイター機能',
			description:
				'フォグボリュームファイルの作成とエンティティプロパティの自動補完機能を有効化します。',
		},
		enableGameTestFramework: {
			name: 'GameTestフレームワークの有効化',
			description:
				'マニフェストの GameTest 関連モジュールとGameTestスクリプトの自動補完機能を有効化します。',
		},
		experimentalMolangFeatures: {
			name: '実験的な Molang の機能',
			description:
				'実験的な Molang のクエリに対する自動補完機能を有効にします。',
		},
		theWildUpdate: {
			name: 'ワイルドアップデート',
			description:
				'Wild Update で導入された新機能の自動補完機能を有効にします。',
		},

		educationEdition: {
			name: 'Education Edition の有効化',
			description:
				'物質還元レシピなどの教育機能で自動補完機能を有効にします。',
		},
	},
	// Windows
	windows: {
		sidebar: {
			disabledItem: 'このアイテムは無効です',
		},
		changelogWindow: {
			title: "What's new?",
		},
		openFile: {
			title: '開く',
			search: 'ファイルの検索...',
			noData: '見つかりませんでした...',
		},
		assetPreview: {
			title: 'アセットプレビュー',
			previewScale: 'プレビュースケール',
			assetName: 'アセット名',
			boneVisibility: 'ボーンの可視性',
			backgroundColor: '背景色',
			outputResolution: '解像度',
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
				endsInPeriod:
					'プロジェクト名の末尾にピリオドを使用することはできません',
			},
			projectDescription: 'プロジェクトの説明（任意)',
			projectPrefix: 'プロジェクト名',
			projectAuthor: 'プロジェクト作成者',
			projectTargetVersion: 'プロジェクトの対象バージョン',
			rpAsBpDependency:
				'リソースパックをビヘイビアーパックの依存関係として登録する',
			bpAsRpDependency:
				'ビヘイビアーパックをリソースパックの依存関係として登録する',
			useLangForManifest: 'マニフェストにパック名/説明文を直接追加する',
			create: '作成',
			saveCurrentProject:
				'新しいプロジェクトを作成する前に現在のプロジェクトを保存しますか？ 保存されていない変更点は失われてしまいます',
			individualFiles: {
				name: '個別ファイル',
				file: {
					player: {
						name: 'player.json',
						description:
							'プレーヤーのデフォルトビヘイビアーを定義します。',
					},
					tick: {
						name: 'tick.json',
						description: 'ティック毎に実行する機能の定義をします。',
					},
					skins: {
						name: 'skins.json',
						description: '作成したスキンの定義をします。',
					},
					blocks: {
						name: 'blocks.json',
						description:
							'ブロックのテクスチャ/サウンドを 1 つにまとめて定義します。',
					},
					terrainTexture: {
						name: 'terrain_texture.json',
						description:
							'ブロック面のテクスチャを割り当てを定義します。',
					},
					itemTexture: {
						name: 'item_texture.json',
						description:
							'アイテムのテクスチャを割り当てを定義します。',
					},
					flipbookTextures: {
						name: 'flipbook_textures.json',
						description:
							'ブロックテクスチャのアニメーションを定義します。',
					},
					biomesClient: {
						name: 'biomes_client.json',
						description:
							'バイオーム特有の効果がどのようにレンダリングされるかを定義します。',
					},
					sounds: {
						name: 'sounds.json',
						description: '特定のゲーム機能のサウンドを定義します。',
					},
					soundDefinitions: {
						name: 'sound_definitions.json',
						description:
							'プロジェクト内の他の場所で使用するサウンドファイルのIDを定義します。',
					},
				},
			},
		},
		createPreset: {
			title: 'プリセットの作成',
			searchPresets: 'プリセットを検索...',
			overwriteFiles:
				'このプリセットは 1 つまたは複数の既存のファイルを上書きします。 続行しますか？',
			overwriteFilesConfirm: '続行',
			overwriteUnsavedChanges:
				'このプリセットは未保存の変更がある 1 つまたは複数のファイルを上書きします。 続行しますか？',
			overwriteUnsavedChangesConfirm: '続行',
			validationRule: {
				alphanumeric: '使用できる文字は英数字とアンダーラインのみです',
				lowercase: '使用できる文字は小文字のみです',
				required: 'この項目は必須です',
				noEmptyFolderNames: 'フォルダー名を空にすることはできません',
			},
			showAllPresets: 'すべてのプリセットを表示',
			disabledPreset: {
				experimentalGameplay:
					'要求される実験的ゲームプレイが有効になっていません',
				packTypes: '要求されるパックがプロジェクトにありません',
				targetVersion:
					'要求されるターゲットバージョンが指定されていません',
			},
		},
		deleteProject: {
			confirm: '削除',
			description: 'このプロジェクトを削除してもよろしいですか？',
		},
		socials: {
			title: 'ソーシャル',
			content:
				'bridge. 公式の Twitter, Github, Discord サーバーをぜひチェックしてください！',
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
					'.brproject ファイルを選択してプロジェクトを開きます。',
				saveCurrentProject:
					'新しいプロジェクトを読み込む前に現在のプロジェクトを保存しますか？',
			},
			wrongFileType:
				'プロジェクトは .brproject または .mcaddon ファイルでなければなりません。',
			addPack: 'パックの追加',
		},
		filePath: {
			title: 'ファイルパスの選択',
		},
		lootSimulatorSettings: {
			title: 'シミュレーター設定',
			repeat: {
				name: 'リピートオプション',
				amount: {
					name: '繰り返し回数',
					description: 'ルートテーブルを設定回数繰り返します',
				},
				itemFound: {
					name: 'アイテムID',
					description:
						'指定されたIDのアイテムスタックが見つかるまで、ルートテーブルを実行します。',
				},
				quantityFound: {
					name: '数量',
					description:
						'指定された数量のアイテムスタックが見つかるまで、ルートテーブルを実行します。',
				},
			},
			killConditions: {
				looting: {
					name: 'ドロップ増加',
					description:
						'ルートテーブルを動かすのに使用されるドロップ増加のレベル、0ならドロップ増加なし',
				},
			},
		},
		packExplorer: {
			title: 'パックエクスプローラー',
			searchFiles: 'ファイルの検索...',
			categories: 'カテゴリー',
			refresh: {
				name: 'プロジェクトの再読み込み',
				description:
					'ファイル追加されました。現在のプロジェクトを再読み込みます。',
			},
			restartWatchMode: {
				name: 'ウォッチモードの再起動',
				description:
					'ウォッチモードを再起動し、プロジェクトで出力されたパックの削除と再コンパイルを行います。',
				confirmDescription:
					'本当にウォッチモードを再起動しますか？ プロジェクトの規模によっては時間がかかる場合があります。 コンパイラを再起動すると com.mojang フォルダからプロジェクトのアドオンが削除され、再コンパイルされます!',
			},
			createPreset: '新規ファイル',
			projectConfig: {
				name: 'プロジェクト設定を開く',
				missing:
					'このプロジェクトの config.json ファイルが見つかりませんでした。 すべてのプロジェクトが正常に動作するためにはプロジェクトのコンフィグファイルが必要です。',
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
				open: {
					name: '開く',
					description: 'エディタでファイルを開く',
				},
				openInSplitScreen: {
					name: '分割画面で開く',
					description: '分割画面でファイルを開く',
				},
				delete: {
					name: '削除',
					description: 'ファイルやフォルダーの削除',
					confirmText: '本当に削除しますか?',
					noRestoring: '後からファイルを復元することはできません',
				},
				rename: {
					name: '名前の変更',
					description: 'ファイル名の変更',
					sameName:
						'新しいファイル名は大文字と小文字が異なるだけです。 Windowsではサポートされません。',
				},
				duplicate: {
					name: '複製',
					description: 'ファイルを複製する',
				},
				viewCompilerOutput: {
					name: 'コンパイラの出力表示',
					description: 'このファイルのコンパイラ出力を表示する',
					fileMissing: 'このファイルはまだコンパイルされていません',
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
					name: '新しいフォルダー',
					description: '新規フォルダー作成',
				},
				findInFolder: {
					name: 'フォルダー内検索',
					description: 'フォルダー内を検索する',
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
					description: 'bridge. のサイドバー要素のサイズを縮小します',
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
						'プロジェクトの切り替え時にキャッシュを強制的に再読み込みします。 1 人で作業していてプロジェクトの編集にのみ bridge. を使用する場合は無効にします。',
				},
				packSpider: {
					name: 'Pack Spider',
					description:
						'Pack Spider はプロジェクト内のファイルを接続し、その接続を仮想ファイルシステムで表示します。',
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
						'アプリを起動すると前回 bridge. を使用したときのタブが復元されます。',
				},
				resetBridgeFolder: {
					name: 'ルートフォルダーの選択',
					description:
						'bridge. が動作するメインフォルダーを選択します',
				},
				openProjectChooserOnAppStartup: {
					name: 'プロジェクトを選択を開く',
					description:
						'bridge. の起動時に自動的に「プロジェクトを選択」を開くようにします。',
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
				incrementVersionOnExport: {
					name: 'バージョンのインクリメント',
					description:
						'プロジェクトのエクスポート時にパックマニフェスト内のバージョン番号を自動的にインクリメントします。',
				},
				addGeneratedWith: {
					name: '"generated_with"の追加',
					description:
						'プロジェクトのマニフェストに "generated_with" メタデータを追加します',
				},
			},
			editor: {
				name: 'エディタ',
				jsonEditor: {
					name: 'JSON エディタ',
					description: 'JSONファイルの編集方法を選択します',
				},
				bridgePredictions: {
					name: 'bridge. 予測機能',
					description:
						'bridge. のツリーエディタ内で値やオブジェクトを追加するかどうかをアプリがインテリジェントに判断できるようにします。 これによりJSONの編集が大幅に簡素化されます。',
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
						'bridge. のツリーエディタでノードを選択すると自動的にノードを開きます',
				},
				dragAndDropTreeNodes: {
					name: 'ツリーノードのドラッグ＆ドロップ',
					description:
						'bridge. のツリーエディタ内でのツリーノードのドラッグ＆ドロップを有効または無効にします',
				},
			},
		},
		projectFolder: {
			title: 'プロジェクトフォルダー',
			content:
				'bridge. を正常に動作するためには、プロジェクトフォルダーにアクセスする必要があります。',
		},
		extensionStore: {
			title: '拡張機能ストア',
			searchExtensions: '拡張機能を検索...',
			deleteExtension: '拡張機能を削除',
			activateExtension: '拡張機能の有効化',
			deactivateExtension: '拡張機能の無効化',
			offlineError:
				'拡張機能の読み込みに失敗しました。 お使いの機器がネットワークに接続されていることを確認してください。',
			incompatibleVersion: '現在のバージョンと互換性がありません',
			compilerPluginDownload: {
				compilerPlugins: 'コンパイラプラグイン',
				title: 'コンパイラプラグインをダウンロード',
				description:
					'新しいコンパイラプラグインをダウンロードしました。 コンパイラコンフィグファイルにこのプラグインを追加してください。',
				openConfig: 'コンフィグを開く',
			},
		},
		pluginInstallLocation: {
			title: 'インストール先の選択',
		},
		unsavedFile: {
			description: 'このファイルを閉じる前に変更内容を保存しますか？',
			save: '保存して閉じる',
		},
		browserUnsupported: {
			title: '未対応のブラウザ',
			description:
				'bridge. v2 をより快適にご利用いただくためには Chrome（Desktop） または Edge（Chromium） をご利用ください。 お使いのブラウザはファイルを直接保存したり、プロジェクトを com.mojang フォルダーに同期することをサポートしていません。',
			continue: '続行',
		},
		invalidJson: {
			title: '無効な JSON',
			description:
				'bridge. のツリーエディタで無効な JSON ファイルを開くことはできません。 この問題を解決するには設定で JSON エディタタイプを「Raw Text」に切り替えて手動で修正してください。',
		},
		loadingWindow: {
			titles: {
				loading: '読み込み中...',
			},
		},
		upgradeFs: {
			title: 'ファイルシステムのアップグレード',
			description:
				'お使いのブラウザがファイルを直接コンピュータに保存する機能に対応しました。今すぐアップグレードしますか？',
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
				description: 'bridge. の自動補完用データを読み込んでいます',
			},
		},
	},
	fileDropper: {
		importFiles: 'ファイルをドロップするとインポートされます!',
		importFailed:
			'bridge. はファイルをインポートすることができませんでした',
		andMore: '...and more!',
		importMethod: 'インポート方法',
		mcaddon: {
			missingManifests:
				'.mcaddonファイル内のパックマニフェストが見つからなかったためデータをロードできませんでした',
		},
		saveToProject: {
			title: 'プロジェクトへの保存',
			description1: '',
			description2: 'をプロジェクト内に保存します',
		},
		openFile: {
			title: 'ファイルを開く',
			description1: '',
			description2: 'を開き編集した内容を元のファイルに保存します',
		},
	},
	comMojang: {
		folderDropped:
			'このフォルダーをデフォルトの com.mojang フォルダーとして設定しますか？',
		title: 'com.mojang フォルダーへのアクセス',
		permissionRequest:
			'プロジェクトをコンパイルするには com.mojang フォルダーにアクセスする必要があります',
		status: {
			sucess:
				'com.mojang へのプロジェクトの同期設定は正しく設定されています。',
			deniedPermission:
				'com.mojang へのフォルダーアクセス権限が与えられていません',
			notSetup:
				'com.mojang への同期設定をしていません。 com.mojang フォルダを bridge. にドラッグしてください。',
			notAvailable:
				'プロジェクトを com.mojang フォルダーに同期する機能は Chrome と Edge ユーザーのみ利用可能です。',
		},
	},
	findAndReplace: {
		name: '検索と置換',
		search: '検索',
		replace: '置換',
		replaceAll: 'すべて置換',
		includeFiles: '含めるファイル',
		excludeFiles: '除外するファイル',
		noResults: '該当する結果はありませんでした',
		noSearch: '入力を開始すると検索クエリの結果がここに表示されます。',
	},
	preview: {
		name: 'プレビュー',
		viewAnimation: 'アニメーションの表示',
		viewModel: 'モデルの表示',
		viewParticle: 'パーティクルの表示',
		viewEntity: 'エンティティの表示',
		viewBlock: 'ブロックの表示',
		simulateLoot: 'ルートシミュレーター',
		failedClientEntityLoad:
			'接続されているクライアントエンティティの読み込みに失敗しました',
		invalidEntity:
			'無効な JSON を持つエンティティのプレビューを開くことができません。 ファイル内の JSON エラーを修正してから再度お試しください。',
		chooseGeometry: 'ジオメトリの選択',
		noGeometry:
			'このファイル内に有効なジオメトリが見つかりません。 JSON が有効であること、ファイル構造が正しいこと、および指定された識別子を持つジオメトリが存在することを確認してください。',
		lootTableSimulator: {
			emptyLootOutput: '出力が空です。実行して結果を出力してください。',
			data: {
				value: 'データ値',
				enchantments: 'エンチャント',
				blockStates: 'Block States',
				itemAuxValue: '補助値',
				eggIdentifier: 'スポーンするエンティティ',
				bannerType: 'バナータイプ',
				bookData: {
					view: '本を見る',
					title: 'タイトル',
					author: '著者',
				},
				durability: '耐久値',
				lore: '伝承',
				displayName: '表示名',
				mapDestination: '地図の目的地',
			},
		},
	},
	initialSetup: {
		welcome: 'ようこそ bridge. v2 へ!',
		welcomeCaption: 'Minecraft アドオンのための強力な統合開発環境',
		step: {
			installApp: {
				name: 'bridge. をインストール',
				description:
					'最高の体験をするためには bridge. v2をアプリとしてインストールしてください。',
			},
			bridge: {
				name: 'bridge. フォルダー',
				description:
					'bridge. がアプリ関連のデータやプロジェクトのデータを保存するフォルダーを作成/選択してください。',
			},
			bridgeProject: {
				name: 'bridge. プロジェクト',
				description:
					'新しいプロジェクトを作成しますか？それとも既存のプロジェクトを .brproject ファイルからインポートしますか？',
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
				name: 'com.mojang フォルダー',
				description:
					'com.mojang フォルダーを bridge. にドラッグしてプロジェクトをフォルダと同期させます。 これにより Minecraft for Windows 10 の中でアドオンに自動的にアクセスできるようになります。 com.mojang の同期設定は bridge. を開いている間いつでも行えます。',
				extraDescription: 'com.mojang フォルダーをドラッグ',
			},
			editorType: {
				name: 'エディタータイプの選択',
				description:
					'JSON ファイルをどのように編集しますか？ あとで設定を変更することもできます。',
				rawText: {
					name: 'Raw Text',
					description:
						'JSON をプレーンテキスト形式で編集します。 中級から上級の開発者に最適です。 高度な自動補完機能とJSONの検証機能を備えています。',
				},
				treeEditor: {
					name: 'Tree Editor',
					description:
						'JSON をツリー状に編集します。 初心者や中級者のクリエイターに最適です。JSON の知識をほとんど必要とせずに編集が可能です。',
				},
			},
		},
	},
	editors: {
		treeEditor: {
			add: '追加',
			addObject: 'オブジェクトの追加',
			addArray: '配列の追加',
			addValue: '値の追加',
			forceValue: '必須',
			edit: '編集',
		},
	},
	functionValidator: {
		actionName: 'Function を検証',
		tabName: '関数 バリデーター',
		errors: {
			common: {
				expectedEquals: '= がありません',
				expectedValue: '値がありません',
				expectedType: {
					part1: "セレクタの型は '",
					part2: "' ではありません '",
					part3: "' にしてください",
				},
				expectedComma: '， がありません',
				unclosedString: '文字列が閉じられていません',
				spaceAtStart: '先頭の空白文字はサポートされていません',
				expectedColon: ': がありません',
				unexpectedOpenCurlyBracket: '予期せぬ { があります',
				unexpectedCloseCurlyBracket: '予期せぬ } があります',
				unexpectedOpenSquareBracket: '予期せぬ [ があります',
				unexpectedCloseSquareBracket: '予期せぬ ] があります',
			},
			command: {
				empty: '空のコマンドはサポートされていません',
				invalid: {
					part1: "コマンド '",
					part2: "' は有効なコマンドではありません",
				},
			},
			identifiers: {
				missingNamespace: 'ID に名前空間がありません',
			},
			ranges: {
				missingFirstNumber: '整数部が正しくありません',
				missingDot: '予期しない少数点の位置です',
				missingSecondNumber: '少数部が正しくありません',
			},
			selectors: {
				emptyComplex: 'セレクター属性が空です',
				expectedStringAsAttribute:
					'セレクター属性は文字列である必要があります',
				invalidSelectorAttribute: {
					part1: "'",
					part2: "' は有効なセレクター属性ではありません",
				},
				unsupportedNegation: {
					part1: "セレクター属性: '",
					part2: "' は否定をサポートしていません",
				},
				multipleInstancesNever: {
					part1: "セレクター属性: '",
					part2: "' は複数のインスタンスをサポートしていません",
				},
				multipleInstancesNegated: {
					part1: "セレクター属性: '",
					part2:
						"' は否定された場合のみ複数のインスタンスをサポートします",
				},
				valueNotValid: {
					part1: "セレクター属性は '",
					part2: "' をサポートしていません",
				},
				expectedLetterAfterAt: '@ の後に文字がありません',
				invalid: {
					part1: "セレクター: '",
					part2: "' は有効なセレクタではありません",
				},
				selectorNotBeforeOpenSquareBracket: '予期しない [ があります',
			},
			scoreData: {
				empty: 'スコアデータが空です',
				expectedStringAsAttribute:
					'スコアデータは文字列でなければなりません',
				invalidType: {
					part1: "スコアデータでは '",
					part2: "' 型はサポートされていません",
				},
				repeat: 'スコアデータ値は繰り返し使えません',
			},
			arguments: {
				noneValid: {
					part1: '有効なコマンド形式ではありません。 第',
					part2: "引数が無効です。 現在'",
					part3: "' 型はサポートされていません。",
				},
				noneValidEnd: {
					part1:
						'有効なコマンド形式ではありません。引数が不足しているか、第',
					part2: '引数が無効です。',
				},
			},
		},
		warnings: {
			schema: {
				familyNotFound: {
					part1: "family='",
					part2:
						"'が見つかりませんでした。これは何かの間違いか、他のアドオンのタグである可能性があります。",
				},
				typeNotFound: {
					part1: "type='",
					part2:
						"'が見つかりませんでした。これは何かの間違いか、他のアドオンのタグである可能性があります。",
				},
				tagNotFound: {
					part1: "tag='",
					part2:
						"'が見つかりませんでした。これは何かの間違いか、他のアドオンのタグである可能性があります。",
				},
				schemaValueNotFound: {
					part1: "value='",
					part2:
						"'が見つかりませんでした。これは何かの間違いか、他のアドオンのタグである可能性があります。",
				},
			},
			data: {
				missingData: '一部のデータが正しく読み込まれませんでした',
			},
		},
	},
}

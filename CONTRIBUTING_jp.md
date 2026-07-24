**「bridge.」** への貢献をご検討いただきありがとうございます。

**Other Languages:** [English](./CONTRIBUTING.md) | **日本語**

> **💡 Note:**
> このドキュメントは日本語翻訳版です。最新の正確な情報は [英語版のCONTRIBUTING.md](./CONTRIBUTING.md) をご確認ください。

# 開発の始め方

コードの編集には **Visual Studio Code (VSCode)** の使用を推奨します。<br />
また、アプリケーションのテストを開始するには、[NodeJS](https://nodejs.org) のインストールが必要です。

ターミナルを開き、**「bridge.」** をクローンしたディレクトリに移動して以下のコマンドを実行してください。

```bash
# 依存関係のインストール
npm i
# 開発用サーバーの起動
npm run dev
# 「bridge.」のビルド
npm run build
```

## デスクトップ版(ネイティブビルド)

bridge. v2のデスクトップ版ビルドには [Tauri](https://tauri.app/) を使用しています。 <br />
開発モードでデスクトップアプリを実行したい場合は、[こちらの手順](https://tauri.app/v1/guides/getting-started/prerequisites) に従って環境構築を行ってください。その後、以下のコマンドを実行してTauri CLIをインストールします。

```bash
cargo install tauri-cli
```

準備ができたら、以下のコマンドで開発モードのデスクトップアプリを起動できます。

```bash
cargo tauri dev
```

# コード規約

## 1. 動作確認

このリポジトリに貢献するすべてのコードは、**動作確認済み**である必要があります。機能が意図通りに動作し、予期しない挙動が発生しないことを少なくとも一度は実際にテストしてください。また、アプリケーションのビルド時にコンソールにエラーが出ていないことも確認してください。

## 2. コードスタイル

### 一般事項

本プロジェクトでは、コミット前に **Prettier** を使用してコードスタイルを自動整形します。最もスムーズに開発を進めるため、VS Code用の Prettier拡張機能 のインストールを推奨します。

### 命名規則

すべての識別子名は **キャメルケース (camelCase)** で記述してください。

```javascript
// 例
let myVar = 'Hello World!'

function doSomethingNow(par1, par2) {
	doSomething(par1 + par2)
}
```

# Pull Requestの作成

作業は必ず`dev`ブランチで行ってください。また、Pull Requestを送信する際は`dev`ブランチをベース（マージ先）として指定してください。

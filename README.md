# SaaSus Docs MCP Server

SaaSus Docs MCP Serverは、Model Context Protocol (MCP) サーバーとして動作し、SaaSus Platformのドキュメント検索機能をClaude DesktopやCursorなどのMCP互換クライアントから利用できるようにします。

## 前提条件

- Node.js（v22推奨）
- npm（Nodeに含まれています）

## インストール

### 1. リポジトリのクローン

以下のコマンドでプロジェクトをクローンしてください。

```sh
git clone https://github.com/saasus-platform/saasus-docs-mcp-server.git
cd saasus-docs-mcp-server
```

### 2. 依存関係のインストールとビルド

プロジェクトのルートディレクトリで以下のコマンドを実行してください。

```sh
npm install
npm run build
```

ビルドが完了すると、ルートディレクトリに`server.js`ファイルが生成されます。

## 提供される機能

このMCPサーバーは以下のツールを提供します：

- **saasus-docs-search-urls**: SaaSus Platformドキュメント内を検索し、関連記事のURLを取得
- **saasus-docs-get-content**: 指定されたURLのSaaSus Platformドキュメント記事の完全なコンテンツを取得

## 設定前の準備

### パスの確認

設定を行う前に、以下のコマンドで必要なパスを確認してください。

nodeのパスを確認：

```sh
which node
```

`server.js`のパスを確認：

```sh
realpath server.js
```

## Claude Desktopでの設定

Claude Desktopを開き、「設定」→「開発者」→「構成を編集」からサーバー設定を追加してください。

```json
{
    "mcpServers": {
        "saasus-docs": {
            "command": "/path/to/node",
            "args": [
                "/path/to/server.js"
            ]
        }
    }
}
```

設定後、Claude Desktopを再起動してください。

## Claude Code (CLI) での設定

Claude CodeのCLIを使用して、以下のコマンドでMCPサーバーを登録できます。

```sh
claude mcp add --scope user saasus-docs-mcp-server /path/to/node /path/to/server.js
```

## Cursorでの設定

### 1. 設定画面の表示

Cursorの設定を開き、「MCP」セクションに移動してください。

### 2. サーバー設定の追加

以下の設定を追加してください。

```json
{
    "mcpServers": {
        "saasus-docs": {
            "command": "/path/to/node",
            "args": [
                "/path/to/server.js"
            ]
        }
    }
}
```

## 使用例

このMCPサーバーを使用することで、Claude DesktopやCursorから直接SaaSus Platformのドキュメントを検索・取得できます。

```
# SaaSus Platformの料金プランについて調べて
# → saasus-docs-search-urlsツールで関連記事を検索
# → saasus-docs-get-contentツールで記事の詳細内容を取得
```

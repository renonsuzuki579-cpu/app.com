# 他人評価アプリ

写真を投稿して、みんなから評価してもらう＆AI診断を受けるアプリです。

## 🚀 デプロイ手順（すべてブラウザだけでOK）

### Step 1: GitHubでプライベートリポジトリを作る

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」
3. 設定：
   - **Repository name**: `hyoka-app`（お好きな名前）
   - **Private** を選択 ← 重要
   - **Add a README file** にチェック
4. 「Create repository」をクリック

### Step 2: ファイルをアップロード

1. 作ったリポジトリのページで「uploading an existing file」をクリック
   （または「Add file」→「Upload files」）
2. **このフォルダの中身を全部ドラッグ＆ドロップ**
   - `src/` フォルダ（←中身も一緒に）
   - `public/` フォルダ（←もし空でも一応）
   - `package.json`
   - `next.config.js`
   - `jsconfig.json`
   - `.gitignore`
   - `README.md`
3. 下にスクロールして「Commit changes」をクリック

### Step 3: Vercelにデプロイ

1. [vercel.com](https://vercel.com) にアクセス
2. 「Continue with GitHub」でログイン
3. 「Add New...」→「Project」
4. さっき作ったリポジトリ `hyoka-app` の横の「Import」をクリック
5. そのまま「Deploy」をクリック（何も変更しなくてOK）

数十秒待つと `https://hyoka-app-xxx.vercel.app` のようなURLができます🎉

### Step 4: APIキーを設定（AI診断を本物にする）

**この手順をスキップすると、AI診断はデモモード（ダミーデータ）で動きます。**

1. Vercelの管理画面でプロジェクトを開く
2. 「Settings」→「Environment Variables」
3. 以下を追加：
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: あなたのAnthropic APIキー（`sk-ant-...`）
   - Environments: すべてチェック
4. 「Save」
5. 「Deployments」タブ → 一番上の「...」→「Redeploy」

これでAI診断が本物のClaudeで動きます。

### Step 5: 身内に共有

Vercelの管理画面に表示されているURLをスマホに送るだけ！  
GitHubリポジトリはプライベートのままでもアプリは公開URLでアクセスできます。

**アクセス制限したい場合：**
Vercelの「Settings」→「Deployment Protection」→「Password Protection」をONにすると、URLを知ってる人でもパスワードが必要になります（Pro プラン必須）。無料で制限したい場合は、URLを知っている人だけに渡すという運用になります。

---

## 🔑 APIキーの扱い

| モード | 条件 | 動作 |
|---|---|---|
| **デモモード** | APIキーなし | 誰が診断しても同じダミー結果が返る |
| **本番モード** | `ANTHROPIC_API_KEY` を設定 | 本物のClaudeが画像を見て診断 |

APIキーはVercelのサーバー側だけに保存され、ブラウザには絶対に送られません。  
GitHubにも絶対にコミットしないでください（`.gitignore`で除外済み）。

---

## 🛠 技術スタック

- **Next.js 14**（React + APIルート）
- **Vercel**（ホスティング）
- **Anthropic Claude Sonnet 4**（AI診断）

---

## 📝 今後の課題

- データ永続化（今はリロードで消える）
- ユーザー認証
- 未成年保護・通報機能
- 本番公開前のセキュリティレビュー

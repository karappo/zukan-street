# ストリートビュー図鑑 (`zukan-streetview`)

Nuxt 4 ベースの Street View ピン管理アプリです。  
Street View 上でピンを追加・選択・編集・再配置し、コメント一覧と連動して操作できます。

## セットアップ

```bash
pnpm install
```

## 開発

```bash
pnpm dev
```

- 起動後: `http://localhost:3000`
- Google Maps API キーは `.env` と `runtimeConfig.public.googleMapsApiKey` で設定します。

## 主要コマンド

```bash
pnpm build      # 本番ビルド
pnpm preview    # ビルド結果の確認
pnpm generate   # 静的生成
```

## ディレクトリ構成

- `app/pages/`: ページ
- `app/components/`: UI コンポーネント（Street View、Pins、Comments など）
- `app/composables/`: 状態・ロジック（`usePins` など）
- `app/utils/`: 幾何計算やピン描画ユーティリティ
- `app/assets/css/variables.css`: 配色・スタイル変数

## 補足

- Contributor ガイドは `AGENTS.md` を参照してください。

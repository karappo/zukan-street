# Repository Guidelines

## プロジェクト構成とモジュール配置
- Nuxt 4 アプリです。主要コードは `app/` 配下にあります。
- 画面: `app/pages/`、UI 部品: `app/components/`、再利用ロジック: `app/composables/`、ユーティリティ: `app/utils/`。
- スタイル変数は `app/assets/css/variables.css`、静的ファイルは `public/`。
- サーバー側 TypeScript 設定は `server/tsconfig.json`、全体設定は `nuxt.config.ts` と `tsconfig.json`。

## ビルド・開発コマンド
- 依存関係インストール: `pnpm install`
- 開発サーバー起動: `pnpm dev`（ローカル確認）
- 本番ビルド: `pnpm build`
- 静的生成: `pnpm generate`
- ビルド成果物のプレビュー: `pnpm preview`

`package.json` の `scripts` を基準にし、独自コマンドを増やす場合は用途を PR に明記してください。

## コーディング規約と命名
- 言語は TypeScript + Vue SFC（`<script setup lang="ts">`）を使用します。
- 既存実装に合わせて 2 スペースインデントを維持してください。
- コンポーネント名は `PascalCase`（例: `StreetViewContainer.vue`）、Composable は `useXxx.ts`（例: `useGoogleMaps.ts`）。
- ユーティリティは責務ごとに分割し、命名は機能が分かる英語名にします（例: `geometry.ts`）。

## テスト方針
- 現時点でテストフレームワークは未導入です。
- 変更時は最低限 `pnpm dev` で主要操作（Street View 表示、ピン追加、サイドバー選択）を手動確認してください。
- テスト導入時は `app/` 構成に対応した配置（例: `app/components/__tests__/`）と実行コマンドを本ファイルへ追記します。

## コミットとプルリクエスト
- 直近の履歴は「日本語で簡潔に、変更内容を具体的に説明する」形式です（例: `ドラッグ時に地面グリッドを表示`）。
- 1 コミット 1 意図を基本にし、UI 変更とロジック変更は可能なら分離してください。
- PR には以下を含めてください。
  - 目的と変更点の要約
  - 確認手順（実行コマンド、確認画面）
  - UI 変更時のスクリーンショット（`screenshots/` 活用可）

## 設定・セキュリティ
- Google Maps API キーは `.env` と `runtimeConfig.public.googleMapsApiKey` で管理し、秘密情報をコミットしないでください。

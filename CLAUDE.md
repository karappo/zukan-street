# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Street View 上でピンを追加・編集・再配置し、コメント一覧と連動して操作する Nuxt 4 アプリ。
詳細は README.md を参照。

## コマンド

```bash
pnpm install     # 依存関係インストール
pnpm dev         # 開発サーバー (http://localhost:3000)
pnpm build       # 本番ビルド
pnpm generate    # 静的生成
pnpm preview     # ビルド結果のプレビュー
```

テストフレームワークは未導入。変更時は `pnpm dev` で手動確認（Street View 表示、ピン追加、サイドバー選択）。

## アーキテクチャ

### レイアウト構造

`pages/index.vue` が Splitpanes で左右分割レイアウトを構成する。

- **左ペイン (72%)**: `StreetViewContainer` — Google Street View パノラマ + ピンマーカーオーバーレイ + Three.js グリッド
- **右ペイン (28%)**: `Comments` — ピン一覧 + `Composer`（作成/編集フォーム）

### 状態管理パターン

Composable がグローバルなシングルトン ref を共有する構成（Pinia 等のストアは未使用）。

- **`usePins`**: ピン配列・選択/編集/下書き状態の CRUD
- **`useGoogleMaps`**: Street View Panorama インスタンス・現在の POV/zoom
- **`useDragPin`**: ドラッグ操作の追跡・スナップ・スケール計算
- **`useThreeGrid`**: ドラッグ中に表示される Three.js 地面グリッド
- **`useToast`**: グローバル通知

### データフロー

```
StreetViewContainer (イベント emit)
    ↓
index.vue (イベントハンドラが usePins の状態を更新)
    ↓
Comments / MarkerOverlay (リアクティブに反映)
```

`index.vue` が全コンポーネント間のイベントハブとして機能し、composable の状態を仲介する。

### 座標変換パイプライン

`app/utils/geometry.ts` に集約された空間計算がアプリの中核。

1. **画面クリック → POV**: `pixelToPov()` — ピクセル座標を heading/pitch に変換
2. **POV → 世界座標**: `estimateDistance()` + `destinationPoint()` — pitch から距離を推定し lat/lng を算出
3. **世界座標 → 画面描画**: `getPinPov()` + `povToPixel()` — パララックス補正付きで再投影

パノラマ移動時にピンの pitch を再計算し、実世界の同じ高さに見えるパララックス効果を実現している。

### ピンカラーシステム

`app/utils/pinColor.ts` で 8 色（red, orange, yellow, green, blue, indigo, violet, gray）を管理。
色は CSS 変数（`--pin-color-*`、`app/assets/css/variables.css` で定義）を通じて解決される。
`markerSvg.ts` が SVG 円マーカーを生成する。

## コーディング規約

- TypeScript + Vue SFC（`<script setup lang="ts">`）、2 スペースインデント
- コンポーネント名: `PascalCase`、Composable: `useXxx.ts`
- コミットメッセージ: 日本語で簡潔に変更内容を記述
- 詳細は AGENTS.md を参照

## 環境設定

Google Maps API キーは `.env` に `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=...` として設定。
`nuxt.config.ts` の `runtimeConfig.public.googleMapsApiKey` 経由でアクセスする。

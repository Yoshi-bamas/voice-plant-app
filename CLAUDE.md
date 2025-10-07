# Voice Plant App - Claude Instructions (v1.0)

## Project Overview
**v1.0目標:** 完成された体験 - Clear後の演出、カスタマイズ可能なUI、プロフェッショナルなコンソール

- **Webアプリ:** 音量で植物成長、周波数で色変化（低:緑120°, 高:赤0°）。Clearライン（調整可能）到達で花開き、**Clear後は成長完了状態を維持**。
- **技術:** TypeScript (Strict), p5.js (Canvas), Web Audio API, SimplexNoise。ES Modules。
- **v1.0新機能:**
  - Clear後の状態管理（`PlantState: 'growing' | 'cleared'`）
  - Clearライン目標値スライダー（0.5-1.0可変）
  - Canvas外コンソールUI（デバッグ情報・コントロール分離）
  - 継続的な花びら降下エフェクト（Clear後）

## Coding Guidelines
- **TypeScript**: Strictモード。インターフェース（PlantParams, VolumeData）。any禁止。
- **p5.js**: スケッチ形式（setup/draw）。Canvas操作はp5関数（line, bezier）。
- **CSS**: BEM、レスポンシブ（min-width: 320px）。
- **アニメーション調整（v1.0強化版）**:
  - 茎: 音量(0-1)で高さスケール（0-400px）。Simplexノイズで揺らぎ（±15px、時間ベース）。ベジェ曲線で滑らか（10セグメント）。
  - 葉: ベジェ曲線描画、周波数で角度(-45°~-15°)動的変化、揺らぎに追従。
  - 色: 周波数平均でHSL hue（低:120°緑, 高:0°赤）。
  - **Clear!（v1.0）:**
    - トリガー: `smoothedVolume > clearThreshold`（デフォルト0.8、スライダーで調整可）
    - 粒子: 150個バースト、花色5種（赤/ピンク/オレンジ/黄/白）、グローエフェクト
    - ひび割れ: 12本放射状、枝分かれ50%確率、立体感（ハイライト）
    - **状態遷移:** `growing → cleared`（植物高さ固定、継続的花びら降下）
- **インフラ固め**:
  - マイク: getUserMedia、許可UI必須。エラー型（MediaStreamError）。
  - パフォーマンス: AnalyserNode 60fps、p5.js drawループ最適化。
  - 互換性: Chrome/Edge優先、Safariテスト（AudioContext.suspended）。

## v1.0 Performance Strategy

### Canvas 2D最適化（v1.0採用）
**目標:** 現行コード資産を守りつつ、粒子数を150→500個に増強

**実装方針:**
- `createGraphics()`で事前レンダリング（粒子テンプレート）
- `image()`による高速描画（`circle()`より2-3倍速）
- 継続粒子の上限管理（20個キープ）

**メリット:**
- 既存コード100%互換
- 実装時間: 15-30分
- リスク: ゼロ

### WebGL移行計画（v1.1予定）
**目標:** p5.js WEBGL modeで粒子10000個、3D演出追加

**移行戦略:**
```typescript
// v1.0 → v1.1 移行ステップ（段階的、後方互換）

// Step 1: WEBGL化（main.ts、1行変更）
p.createCanvas(800, 600, p.WEBGL);

// Step 2: 座標系保護（各View.draw()、1行追加）
p.translate(-p.width/2, -p.height/2); // 既存座標そのまま使用可

// Step 3: 3D演出追加（任意、段階的）
p.sphere(size);           // 3D球体粒子
p.rotateZ(angle);         // 回転アニメ
p.directionalLight(...);  // ライティング
```

**互換性保証:**
- コード資産: 95%変更不要（Particle.ts, audio.ts, ViewManager.ts等）
- 演出素材: 100%そのまま（色計算、タイミング、物理演算）
- 変更箇所: 座標補正のみ（translate()1行×6ファイル、計20分）
- ロールバック: 即座に可能（2行削除で元に戻る）

**v1.1で得られる恩恵:**
- 粒子数: 500 → 10000個以上
- GPU並列処理（CPU負荷激減）
- 3D表現（回転、奥行き、カメラワーク）
- シェーダーエフェクト（キラキラ、グロー）

## v1.0 UI/UX Design Principles

### Canvas/Console分離アーキテクチャ
```html
<div class="app-container">
  <div class="canvas-area">      <!-- p5.js描画専用 -->
  <div class="console-area">     <!-- コントロール・デバッグ情報 -->
</div>
```

**レイアウト（CSS Grid）:**
- デスクトップ: Canvas (可変) + Console (固定300px右側)
- モバイル: Console上部 + Canvas下部（縦積み）

**コンソールUI要件:**
- デバッグ情報: 音量、周波数、高さ、Clear状態（数値更新60fps）
- コントロール: View切替、Easy Mode、**Clearラインスライダー（0.5-1.0）**
- スタイリング: SF風（ネオン青、透過背景、グロー）推奨

### 状態管理（v1.0核心機能）
```typescript
type PlantState = 'growing' | 'cleared';

// growing: 音量入力で成長
// cleared: 高さ固定、継続エフェクト（花びら降下20個/秒）
```

**Clear後の挙動:**
1. 植物高さを`clearedHeight`に固定
2. 音量入力を無視（または装飾エフェクトのみ）
3. 継続的な花びら生成（軽量、20粒子上限）
4. ユーザーは次の目標（Fractal切替等）に移行可能

## Commands to Support
- **Generate**: 機能追加（e.g., "PlantStateの型安全な状態遷移"）。
- **Refactor**: 最適化（e.g., "Clear後粒子を軽量化"）。
- **Test**: ユニットテスト（e.g., "clearThreshold調整の動作確認"）。
- **Debug**: UI調整（e.g., "コンソールのレスポンシブ改善"）。

## Hierarchy
- このファイル: 全体ルール、動的生成ガイド。
- src/CLAUDE.md: TS/p5.js特化（型、モジュール）。

## Rule for Coding
- toDo.md にタスクリストが記載されている。基本的にこのtoDoに従って作業を進める。完了したら、toDo.md にチェックをつける。
- toDoの内容と異なる指示が出た場合、それがtoDoの変更を伴う者であれば、toDoの内容を変更する。特にtoDoの変更が伴わない内容なら、気にしなくてよい。
- 作業の過程で、toDoの変更が必要な可能性が発生した場合、その理由とともに、ユーザー側に提案をおこなう。

## 全体ルール
**警告: 絶対遵守。無視禁止。逸脱時は処理中断し、ユーザーに警告通知。**  
- すべてのコード生成/修正時に、エラー処理とテストを統合。
- コンテキスト圧縮対策: このファイルを常に優先参照。/clear でリセット後、再読み込み。

## エラー処理の必須プロセス
エラーが発生したら、**即時停止**。以下のステップを**順守**。スキップ禁止。

### 1. 原因特定
- **必須**: ログ解析 (スタックトレース確認: `traceback.format_exc()`)。
- エラー分類 (例: ネットワーク/認証/構文)。
- アクション: 
  1. ログ出力: `logging.error(f"Error: {e}, Cause: {cause}, Trace: {trace}")`
  2. ユーザーに提示:
エラー: {メッセージ}
原因: {特定内容}
確認: 正しいですか？ [Y/N] 理由:
text### 2. ユーザー確認
- **必須**: 原因提示後、**必ず**確認を求める。Nの場合、代替原因を再特定。
- 例: 「原因: APIキー無効。修正しますか？ [Y/N]」
- 確認なし進行禁止。CLIプロンプトまたはコメントで明示 (# Claude: 確認してください)。

### 3. ToDoリスト化
- **必須**: 解決策をToDoリストとして構造化。テストタスクを必ず追加。
- フォーマット (GitHub風チェックボックス):
```markdown
## ToDo: {エラー名} 解決
- [ ] タスク1: {修正アクション} (例: APIキー更新)
- [ ] タスク2: テスト生成 (例: pytest用単体テストコード作成)
- [ ] タスク3: テスト実行 & 検証 (例: `pytest -v`, カバレッジ80%以上確認)
- [ ] タスク4: ログ確認 (例: `tail -f error.log`)
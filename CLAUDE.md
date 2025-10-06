# Voice Plant App - Claude Instructions

## Project Overview
- Webアプリ: 音量で植物成長（茎高さ）、周波数で色変化（低:緑120°, 高:赤0°）と葉分岐。音量閾値（0.8）でコンクリート突き破り、花開き（粒子）、"Clear!"表示。
- 技術: TypeScript, p5.js (Canvas), Web Audio API, SimplexNoise。ES Modules。
- 目標: 動的生成（Path2D/ベジェ曲線）、神秘的ビジュアル（ノイズ揺れ）、型安全、モバイル対応。

## Coding Guidelines
- **TypeScript**: Strictモード。インターフェース（PlantParams, VolumeData）。any禁止。
- **p5.js**: スケッチ形式（setup/draw）。Canvas操作はp5関数（line, bezier）。
- **CSS**: BEM、レスポンシブ（min-width: 320px）。
- **アニメーション調整**:
  - 茎: 音量(0-1)で高さスケール（0-400px）。ベジェ曲線で滑らか。
  - 葉: SVGシンボル、周波数(0-255)で角度(-30°~30°)、分岐数(2-10)。
  - 色: 周波数平均でHSL hue（低:120°, 高:0°）。Simplexノイズで揺れ。
  - Clear!: 音量>0.8で粒子エフェクト（花）、コンクリート裂け（Path2D）、"Clear!"フェード。
- **インフラ固め**:
  - マイク: getUserMedia、許可UI必須。エラー型（MediaStreamError）。
  - パフォーマンス: AnalyserNode 60fps、p5.js drawループ最適化。
  - 互換性: Chrome/Edge優先、Safariテスト（AudioContext.suspended）。

## Commands to Support
- **Generate**: 機能追加（e.g., "p5.jsで型安全な茎ベジェ曲線"）。
- **Refactor**: 最適化（e.g., "animation.tsのノイズ計算を軽量化"）。
- **Test**: ユニットテスト（e.g., "mock音量でClear!テスト"）。
- **Debug**: パラメータ調整（e.g., "分岐角度を±10°狭く"）。

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
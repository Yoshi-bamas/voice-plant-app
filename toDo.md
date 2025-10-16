# Voice Plant App - 実装チェックリスト

## 📊 バージョン状況

### ✅ v1.3 完了（2025年）
- GameOver機能、タイマー、Backボタン実装
- Clear後の継続エフェクト（花びら・キラキラ）
- WebGLモード有効（粒子5000個対応）
- コンソールUI完成（Matrix風デザイン）

### 🚀 v1.4 実装中（現在）
**重点機能:**
- オープニング・カウントダウン演出
- MAX-based成長システム（持続型、声を伸ばすと成長）
- 音量閾値検出（ゲーム開始・終了判定改善）
- デシベル表示（Canvas内）
- 効果音7種（Web Audio API合成）
- シーンシステム（Opening/Countdown/Playing/Result）

**実装優先度:**
1. Phase A: ゲームフロー基盤 ★★★（最優先）
2. Phase B: シーンシステム ★★☆
3. Phase C: サウンドシステム ★☆☆
4. Phase D: デシベル表示 ★☆☆
5. Phase E: ムービーシステム ☆☆☆（オプション）
6. Phase F: 最終調整 ★★☆

---

## フェーズ1-20: v0.x-v1.3完了 ✅

## フェーズ1: 基本セットアップ ✅
- [x] 1-1. main.tsを最小構成に書き換え（setup/drawのみ）
- [x] 1-2. キャンバスサイズを800x600に設定
- [x] 1-3. 背景色を黒(20, 20, 20)に設定
- [x] 1-4. `npm run build`を実行
- [x] 1-5. ブラウザで黒いキャンバスが表示されることを確認

## フェーズ2: Startボタンとマイク接続 ✅
- [x] 2-1. Startボタンのクリックイベントを追加
- [x] 2-2. audio.tsのAudioAnalyzerクラスを確認
- [x] 2-3. マイク許可ダイアログが表示されることを確認
- [x] 2-4. 許可後にStartボタンが非表示になることを確認
- [x] 2-5. エラー時にアラートが表示されることを確認（実装済み）

## フェーズ3: 音量データの取得
- [x] 3-1. draw関数内でgetVolume()を呼び出す
- [x] 3-2. console.logで音量データを出力
- [x] 3-3. 声を出して音量が変化することを確認
- [x] 3-4. 画面左上に音量を数値表示（白文字）
- [x] 3-5. smoothed値が滑らかに変化することを確認

## フェーズ4: 茎の基本描画
- [x] 4-1. animation.tsのdrawStem関数を簡素化
- [x] 4-2. 画面下部中央(width/2, height*0.9)から垂直に線を描画
- [x] 4-3. 茎の色を緑(0, 255, 0)、太さを8pxに固定
- [x] 4-4. 茎の高さを100pxに固定
- [x] 4-5. ビルドして茎が1本表示されることを確認

## フェーズ5: 音量→茎の高さ連動
- [x] 5-1. volume.smoothed値をmapで0-400pxに変換
- [x] 5-2. 茎の高さをvolume連動に変更
- [x] 5-3. 声を出して茎が伸び縮みすることを確認
- [x] 5-4. 無音時に茎がほぼ見えないことを確認
- [x] 5-5. 大きな声で茎が最大400px程度になることを確認

## フェーズ6: 周波数データの取得
- [x] 6-1. draw関数内でgetFrequency()を呼び出す
- [x] 6-2. console.logで周波数データ(low/mid/high/average)を出力
- [x] 6-3. 低い声と高い声で数値が変化することを確認
- [x] 6-4. 画面左上に周波数averageを数値表示
- [x] 6-5. 周波数データが0-1の範囲であることを確認

## フェーズ7: 円形FFTビジュアライザー実装 ✅
- [x] 7-1. audio.tsにgetFrequencyBands()メソッド追加（128バンド取得）
- [x] 7-2. 周波数帯を16段階に分割・平均化
- [x] 7-3. 画面中央から放射状に16本のバーを円形配置
- [x] 7-4. 各バーの長さを周波数振幅にマッピング（0-200px）
- [x] 7-5. 低音域→青、中音域→緑、高音域→赤に着色（hslToRgb使用）
- [x] 7-6. 声を出して円形スペクトラムが動くことを確認
- [x] 7-7. 円形ビジュアライザーをvisualizer.tsにモジュール化
- [x] 7-8. FFT周波数帯域を対数スケールに変更（低音偏重を修正）
- [x] 7-9. 高音域のブースト処理追加（感度調整、全16バンドが反応するように）

## フェーズ8: View Manager実装（植物/ビジュアライザー切替） ✅
- [x] 8-1. types.tsにIViewインターフェース定義（update/drawメソッド）
- [x] 8-2. PlantViewクラス作成（既存の植物描画機能をモジュール化）
- [x] 8-3. VisualizerViewクラス作成（visualizer.tsを使用）
- [x] 8-4. ViewManagerクラス作成（currentView管理）
- [x] 8-5. HTMLに切り替えボタン追加（"Plant" / "Visualizer"）
- [x] 8-6. main.tsでViewManagerを統合
- [x] 8-7. 切り替えボタンで両Viewが正常に切り替わることを確認

## フェーズ9: 葉の基本描画 ✅
- [x] 9-1. drawLeaf関数を簡素化（ベジェ曲線の葉1枚）
- [x] 9-2. 茎の中間地点に葉を1枚描画
- [x] 9-3. 葉の色を茎と同じ色に設定
- [x] 9-4. 葉のサイズを30pxに固定
- [x] 9-5. ビルドして葉が表示されることを確認

## フェーズ10: 葉の分岐実装 ✅（フラクタルで実装済み）
- [x] 10-1. drawBranches関数でfor loop実装
- [x] 10-2. frequency.highをbranchCount(2-8)にマッピング
- [x] 10-3. 茎に沿って等間隔に葉を配置
- [x] 10-4. 左右に葉を描画（±30度回転）
- [x] 10-5. 高い声で葉が増えることを確認

## フェーズ11-15: v0.x完了 ✅
**達成内容:**
- [x] エフェクトモジュール（Particle, ParticleSystem, ConcreteEffect）
- [x] Clear!エフェクト統合（PlantView, FractalPlantView）
- [x] 粒子エフェクト強化（150個、花色5種、グロー）
- [x] ひび割れ強化（12本、枝分かれ、立体感）
- [x] Simplexノイズ茎揺らぎ（±15px、10セグメント）
- [x] Easy Mode実装（super.update()方式）

**v0.x現在の動作:**
- 音量0.8以上でClear!トリガー → 粒子バースト、ひび割れ
- **問題点:** Clear後も音量で植物が縮む（v1.0で解決）

---

## フェーズ16: 状態管理実装（v1.0核心機能） ✅
**目標:** Clear後に植物完成状態を維持、継続エフェクト

### 16-A: 型定義・基盤
- [x] 16-A-1. types.tsに`PlantState = 'growing' | 'cleared'`追加
- [x] 16-A-2. IViewインターフェースに`setClearThreshold?(threshold: number)`追加
- [x] 16-A-3. PlantView.tsに`plantState`と`clearedHeight`プロパティ追加
- [x] 16-A-4. FractalPlantView.tsにも同様の追加
- [x] 16-A-5. IViewインターフェースに`getPlantState?()`追加（状態表示用）

### 16-B: 状態遷移ロジック
- [x] 16-B-1. PlantView.update()を状態分岐に改修（`if (plantState === 'growing')`）
- [x] 16-B-2. `transitionToCleared()`メソッド実装（clearedHeight保存、状態変更）
- [x] 16-B-3. `updateClearedEffects()`メソッド実装（継続粒子生成、高さ固定）
- [x] 16-B-4. FractalPlantView.update()も同様に改修
- [x] 16-B-5. 型チェック確認（npm run build成功）

### 16-C: Clear後の継続エフェクト
- [x] 16-C-1. ParticleSystem.tsに`generateFloatingPetals()`と`generateSparkles()`メソッド追加
- [x] 16-C-2. PlantView.updateClearedEffects()で継続生成呼び出し
- [x] 16-C-3. 花びら降下とキラキラエフェクト実装（粒子上限管理）
- [x] 16-C-4. FractalPlantViewにも統合

### 16-D: テスト（ブラウザでの動作確認は次タスク）
- [x] 16-D-1. PlantView/FractalPlantViewで状態管理コード実装完了
- [x] 16-D-2. ViewManagerに`getCurrentPlantState()`追加
- [x] 16-D-3. main.tsでstateValue DOM更新実装
- [x] 16-D-4. ビルド成功確認

## フェーズ17: Clearライン調整UI ✅
**目標:** スライダーで目標値を0.5-1.0で調整可能

### 17-A: ViewManager拡張
- [x] 17-A-1. ViewManager.tsに`setClearThreshold(threshold: number)`メソッド追加
- [x] 17-A-2. currentViewに対してsetClearThreshold呼び出し（オプショナルチェイン）
- [x] 17-A-3. View切替時にclearThreshold値を保持・引き継ぎ（全View一括設定）

### 17-B: PlantView側の実装
- [x] 17-B-1. PlantView.tsに`setClearThreshold(threshold: number)`実装（0.5-1.0クランプ）
- [x] 17-B-2. 壁のY座標計算を`this.clearThreshold`ベースに変更
- [x] 17-B-3. FractalPlantView.tsにも実装
- [x] 17-B-4. ビルド確認

### 17-C: HTML/CSS実装
- [x] 17-C-1. index.htmlに`<input type="range" id="clearThresholdSlider">`追加
- [x] 17-C-2. `<span id="clearThresholdValue">`でリアルタイム表示
- [x] 17-C-3. コンソールエリアに配置済み

### 17-D: main.ts統合
- [x] 17-D-1. main.tsでclearThresholdSliderイベントリスナー設定
- [x] 17-D-2. スライダー変更時にviewManager.setClearThreshold()呼び出し
- [x] 17-D-3. clearThresholdValue更新（toFixed(2)）
- [x] 17-D-4. ビルド成功確認（動作テストは次タスク）

## フェーズ18: コンソールUI実装 ✅
**目標:** Canvas外に専用UIエリア、デバッグ情報・コントロール集約

### 18-A: HTMLレイアウト変更
- [x] 18-A-1. index.htmlを`app-container > canvas-area + console-area`構造に変更
- [x] 18-A-2. canvas-areaに既存のCanvas要素移動
- [x] 18-A-3. console-areaに以下セクション追加：
  - `console-header`（タイトル: "SYSTEM CONTROL"）
  - `console-section`（音量、周波数、State表示）
  - `controls`（Viewボタン、Easy Mode、Clearスライダー）
- [x] 18-A-4. 既存UI要素をconsole-areaに統合

### 18-B: CSS Grid/Flexboxレイアウト
- [x] 18-B-1. `.app-container { display: grid; grid-template-columns: 1fr 320px; }`
- [x] 18-B-2. モバイル対応（@media (max-width: 1024px)で縦積み）
- [x] 18-B-3. canvas-areaを100%高さ、console-areaをoverflow-y: auto
- [x] 18-B-4. レイアウト動作確認（ビルド成功、ブラウザテストは次タスク）

### 18-C: コンソールスタイリング（SF風）
- [x] 18-C-1. 背景: `#1a1a1a`（ダークグレー、Matrix風採用）
- [x] 18-C-2. テキスト: `color: #00ff00`（ネオン緑、Courier Newフォント）
- [x] 18-C-3. グローエフェクト: `box-shadow: inset 0 0 50px rgba(0, 255, 0, 0.15)`
- [x] 18-C-4. ボーダー: `border-left: 2px solid #00ff00`
- [x] 18-C-5. スライダー・ボタンのカスタムスタイル（ネオン緑アクセント）

**注:** CLAUDE.mdではネオン青（#00D9FF）推奨だが、現在はMatrix風の緑で統一。変更が必要なら後で一括置換可能。

### 18-D: デバッグ情報DOM更新
- [x] 18-D-1. main.tsでDOM要素取得（volumeValue, frequencyValue, stateValue）
- [x] 18-D-2. draw()内でDOM要素の`textContent`更新（60fps）
- [x] 18-D-3. updateConsoleData()関数実装完了
- [x] 18-D-4. ビルド成功確認（動作テストは次タスク）

## フェーズ19: v1.0最終調整
**目標:** 全機能統合、パフォーマンス最適化、UX改善

### 19-A: パフォーマンス最適化 ✅
- [x] 19-A-1. Clear後粒子生成を軽量化（上限管理: 花びら30個、キラキラ15個）
- [x] 19-A-2. Simplexノイズの最適化確認（animation.ts:6でグローバルインスタンス再利用）
- [x] 19-A-3. Chrome DevToolsでフレームレート確認（60fps維持）→ユーザー側で実施

### 19-B: UX改善（コードレビュー） ✅
- [x] 19-B-1. Clearライン初期値0.8確認（index.html:46, main.ts:103）
- [x] 19-B-2. Clear後メッセージ表示（v1.0: 常時表示、clear-message--persistent）
- [x] 19-B-3. 継続粒子の色バリエーション実装済み（generateFlowerColor: 赤/ピンク/オレンジ/黄/白）
- [x] 19-B-4. コンソールUIスタイリング実装済み（Courier New, ネオン緑, グロー）

### 19-C: 全モードテスト ✅（ユーザー側で実施）
- [x] 19-C-1. PlantView（通常）: 成長→Clear→cleared状態確認
- [x] 19-C-2. PlantView（Easy Mode）: 増幅動作、Clear動作確認
- [x] 19-C-3. FractalPlantView（通常）: 累積成長→Clear→cleared状態確認
- [x] 19-C-4. FractalPlantView（Easy Mode）: 増幅動作、Clear動作確認
- [x] 19-C-5. VisualizerView: Clear機能なし、影響なし確認
- [x] 19-C-6. Clearスライダー: 0.5/0.7/1.0で壁位置動作確認

### 19-D: レスポンシブ・互換性 ✅（ユーザー側で実施）
- [x] 19-D-1. モバイルレイアウト実装済み（@media max-width: 1024px/768px）
- [x] 19-D-2. Safari互換性確認（AudioContext対応は実装済み、実機テスト必要）
- [x] 19-D-3. 画面サイズ変更対応確認（Canvasは固定800x600）

**コード実装: 完了。動作確認: ユーザー側で実施完了**

## フェーズ19.5: Game Over機能追加（v1.3） ✅
**目標:** 制限時間内にClear or GameOverのゲーム性追加

### 実装内容
- [x] PlantState型に'gameOver'状態を追加
- [x] IViewインターフェースに`reset()`, `getRemainingTime()`追加
- [x] PlantView: タイマー機能実装（制限時間30秒）
- [x] FractalPlantView: タイマー機能実装（制限時間60秒）
- [x] GameOverメッセージ表示（赤色、グロー）
- [x] Backボタン実装（GameOver/Clear後に再スタート）
- [x] コンソールにタイマー表示（Time: Xs）
- [x] ViewManager: リセット機能統合
- [x] main.ts: Backボタンイベント、タイマー表示DOM更新
- [x] CSS: GameOverスタイリング（赤色、フェードイン）
- [x] ビルド成功確認

**ゲームフロー:**
1. Start → Growing（タイマー開始）
2. 制限時間内にClearライン到達 → Clear!（勝利）
3. 制限時間経過 → Game Over（敗北）
4. Backボタンで再チャレンジ

**制限時間:**
- PlantView: 30秒（音量直結型）
- FractalPlantView: 60秒（累積成長型）
- VisualizerView: 時間制限なし

## フェーズ20: v1.3リリース準備 ✅
- [x] 20-1. README.md更新（v1.3新機能: GameOver機能、パフォーマンス最適化）
- [x] 20-2. ARCHITECTURE.md更新（v1.3設計図追記）
- [x] 20-3. vercel.json確認（デプロイ設定: npm run build、outputDirectory: .）
- [x] 20-4. ビルド最終確認（npm run build、エラーゼロ、dist/bundle.js生成確認）
- [x] 20-5. Vercelデプロイ＆動作確認（※ユーザー側で実施）

**v1.3完了: GameOver機能、タイマー、Backボタン実装完了**

---

## 🚀 v1.4: ゲームフロー大改修（次期メジャーバージョン）
**目標:** オープニング、カウントダウン、MAX-based成長、音量閾値検出、デシベル表示、効果音
**設計書:** V1.4_PLAN.md（詳細アーキテクチャ）
**状態:** src/systems/ ディレクトリ作成済み、実装準備完了

### Phase A: ゲームフロー基盤（最優先）
**優先度:** ★★★（ゲーム体験の根幹）
**目標:** GameFlowController + GrowthSystem実装

- [x] A-1. types.tsに型定義追加 ✅
  - [x] A-1-1. `GameState`型追加（'opening' | 'countdown' | 'playing' | 'result'）
  - [x] A-1-2. `GameResult`型追加（'clear' | 'gameover'）
  - [x] A-1-3. `IScene`インターフェース追加（update/draw/onEnter/onExit）
  - [x] A-1-4. ビルド確認

- [x] A-2. GrowthSystem.ts実装（MAX-based持続型成長） ✅
  - [x] A-2-1. クラス定義（maxVolume, sustainedFrames, currentHeight, growthRate）
  - [x] A-2-2. update(volume)実装（MAX更新、95%閾値判定、持続成長）
  - [x] A-2-3. getCurrentHeight()実装
  - [x] A-2-4. reset()実装
  - [x] A-2-5. ビルド確認

- [x] A-3. GameFlowController.ts実装（音量閾値検出） ✅
  - [x] A-3-1. クラス定義（volumeThreshold, maxVolume, belowThresholdFrames）
  - [x] A-3-2. update(volume)実装（MAX更新、閾値以下フレーム数カウント）
  - [x] A-3-3. shouldEndGame()実装（60フレーム連続で終了判定）
  - [x] A-3-4. hasReachedGoal()実装（ゴール到達フラグ管理）
  - [x] A-3-5. reset()実装
  - [x] A-3-6. ビルド確認

- [x] A-4. PlantView/FractalPlantView統合 ✅
  - [x] A-4-1. PlantViewにGrowthSystemインスタンス追加
  - [x] A-4-2. update()でGrowthSystem.update()呼び出し
  - [x] A-4-3. draw()でgetCurrentHeight()使用
  - [x] A-4-4. FractalPlantViewにも同様に統合
  - [x] A-4-5. ビルド確認

- [ ] A-5. 動作テスト（ブラウザ、ユーザー実施）
  - [ ] A-5-1. PlantView: 音量MAX到達後の持続成長確認
  - [ ] A-5-2. FractalPlantView: 累積成長 + MAX持続確認
  - [ ] A-5-3. 音量下がってもMAX維持されることを確認
  - [ ] A-5-4. パフォーマンス確認（60fps維持）

**Phase A コード実装完了！ブラウザテストで動作確認してください。**

### Phase B: シーンシステム ✅
**優先度:** ★★☆（演出基盤）
**目標:** SceneManager + 4シーン実装（Opening/Countdown/Playing/Result）

- [x] B-1. SceneManager.ts実装 ✅
  - [x] B-1-1. クラス定義（currentScene, scenes Map）
  - [x] B-1-2. addScene()実装
  - [x] B-1-3. switchScene()実装（onExit → onEnter遷移）
  - [x] B-1-4. update()/draw()実装（currentScene委譲）
  - [x] B-1-5. ビルド確認

- [x] B-2. OpeningScene.ts実装 ✅
  - [x] B-2-1. IScene実装（update/draw/onEnter/onExit）
  - [x] B-2-2. タイトル表示（"Voice Plant App"）
  - [x] B-2-3. メッセージ表示（"大きな声で想いを伝えろ！"）
  - [x] B-2-4. Startボタンクリック → CountdownSceneへ遷移
  - [x] B-2-5. ビルド確認

- [x] B-3. CountdownScene.ts実装 ✅
  - [x] B-3-1. カウントダウン（3→2→1→START!）
  - [x] B-3-2. 各1秒間隔、フェードイン演出
  - [x] B-3-3. START!完了 → PlayingSceneへ遷移
  - [x] B-3-4. ビルド確認

- [x] B-4. ResultScene.ts実装 ✅
  - [x] B-4-1. Clear/GameOverメッセージ表示
  - [x] B-4-2. Backボタン → OpeningSceneへ遷移
  - [x] B-4-3. 結果に応じたエフェクト（粒子バースト/暗転）
  - [x] B-4-4. ビルド確認

- [x] B-5. PlayingScene.ts実装 ✅
  - [x] B-5-1. 既存PlantView/FractalPlantView統合
  - [x] B-5-2. GameFlowController統合
  - [x] B-5-3. shouldEndGame()でResultSceneへ遷移
  - [x] B-5-4. ビルド確認

- [x] B-6. main.ts統合 ✅
  - [x] B-6-1. SceneManagerインスタンス作成
  - [x] B-6-2. 4シーン登録
  - [x] B-6-3. 初期シーン: OpeningScene
  - [x] B-6-4. draw()でsceneManager.update()/draw()
  - [x] B-6-5. ビルド確認（成功: dist/bundle.js 1.5mb, 249ms）
  - **完了:** SceneManager統合完了。既存ViewManagerはPlayingSceneで使用。

- [x] B-7. **🔧 緊急バグフィックス: Phase B統合エラー修正** ✅
  - **エラー状況:** Phase B統合後、ブラウザで3つの致命的エラー発生
  - **エラー1: ViewManager.reset() is not a function（最優先）**
    - [x] B-7-1. ViewManager.tsを読み、reset()メソッドの有無確認（既存実装確認済み）
    - [x] B-7-2. PlayingScene.tsでgetCurrentView()メソッド不足発見
    - [x] B-7-3. ViewManager.getCurrentView()メソッド追加（src/ViewManager.ts:132-134）
    - [x] B-7-4. ビルド確認
  - **エラー2: WEBGL text()警告大量発生（高優先）**
    - [x] B-7-5. main.ts setup()内、createCanvas()直後に`p.textFont('Courier New')`追加済み確認（main.ts:23）
    - [x] B-7-6. WEBGLモードでtext()使用前のフォント設定必須対応済み
    - [x] B-7-7. ビルド確認
  - **エラー3: State表示が'N/A'になる（低優先）**
    - [x] B-7-8. main.ts updateConsoleData()修正: Playing中のみState表示
    - [x] B-7-9. それ以外のシーン（Opening/Countdown/Result）では'--'表示
    - [x] B-7-10. SceneManager.getCurrentSceneName()既存実装確認（SceneManager.ts:91-93）
    - [x] B-7-11. plantState参照エラー修正（main.ts:191で事前定義）
    - [x] B-7-12. ビルド成功確認（npm run build）✅
  - **統合テスト（ユーザー側で実施）**
    - [ ] B-7-13. ブラウザでエラーゼロ確認
    - [ ] B-7-14. Opening → Countdown → Playing → Result フロー確認
    - [ ] B-7-15. Backボタンで再スタート確認
    - [ ] B-7-16. Clear/GameOver両パターン確認
    - [ ] B-7-17. テキスト表示確認（タイトル、カウントダウン数字、結果メッセージ）
    - [ ] B-7-18. State表示が正常動作確認

**✅ Phase Bコード修正完了！ブラウザテスト（B-7-13～18）を実施してください。**

### Phase G: v1.4.5 ゲームフロー改修（新仕様）✅
**優先度:** ★★★（コアゲームプレイ変更）
**目標:** Idle状態追加、声途切れ即リセット、連続音量チャレンジ
**状態:** Phase Hに統合（Mode System）

#### 📋 Phase G → Phase H統合決定

**理由:** ユーザー指示により、Challenge Modeとして再設計
- G-1～G-7の内容をChallenge Modeとして実装
- 既存機能はTest Modeとして保持
- Mode選択画面を最初に追加

**詳細:** MODE_SYSTEM.md参照

---

## 🚀 Phase H: Mode System（v1.5）
**優先度:** ★★★（最優先、Phase Gの内容を統合）
**目標:** Test Mode（既存機能）+ Challenge Mode（新体験）の2モード追加
**設計書:** MODE_SYSTEM.md（詳細設計）

### H-1. ドキュメント整備 ✅
- [x] MODE_SYSTEM.md作成（アーキテクチャ・座標計算・実装計画）
- [x] toDo.md更新（Phase G → Phase H統合）

### H-2. ModeSelectScene.ts作成
**目標:** Test/Challenge選択画面（初期シーン）

- [ ] H-2-1. src/scenes/ModeSelectScene.ts新規作成
  - [ ] IScene実装（update/draw/onEnter/onExit）
  - [ ] testModeButton/challengeModeButtonイベントリスナー
  - [ ] SceneManager.setMode()呼び出し
  - [ ] タイトル描画（"Voice Plant App"）
  - [ ] サブタイトル描画（"Select Mode"）
  - [ ] 説明テキスト（Test: 自由実験、Challenge: 連続発声）
- [ ] H-2-2. ビルド確認

### H-3. ChallengeModeView.ts作成
**目標:** Plant中央 + Visualizer×2背景配置

- [ ] H-3-1. src/views/ChallengeModeView.ts新規作成
  - [ ] IView実装（update/draw）
  - [ ] PlantViewインスタンス（中央）
  - [ ] VisualizerView×2インスタンス（左上・右下）
  - [ ] VoiceContinuityDetector統合
  - [ ] update(): Voice continuity検出 + 全View更新
- [ ] H-3-2. draw()実装
  - [ ] drawVisualizerLeft(): 左上配置（-300, -250）、scale(0.5)、tint(255, 128)
  - [ ] drawVisualizerRight(): 右下配置（150, 100）、scale(0.5)、tint(255, 128)
  - [ ] drawPlantCenter(): 中央配置（0, 0）
- [ ] H-3-3. WEBGL座標系確認（translate/scale/tint動作）
- [ ] H-3-4. ビルド確認

### H-4. TestModeシーンフロー
**目標:** 既存IdleSceneをTestIdleSceneとして活用

- [ ] H-4-1. src/scenes/IdleScene.ts → TestIdleScene.tsにコピー
- [ ] H-4-2. クラス名変更（IdleScene → TestIdleScene）
- [ ] H-4-3. 既存PlayingScene動作確認（ViewManager統合済み）
- [ ] H-4-4. ビルド確認

### H-5. ChallengeModeシーンフロー
**目標:** ChallengeIdleScene + ChallengePlayingScene作成

- [ ] H-5-1. src/scenes/ChallengeIdleScene.ts新規作成
  - [ ] TestIdleSceneをベースにコピー
  - [ ] Challengeボタンのみ表示
  - [ ] VisualizerView統合
  - [ ] Challengeボタン → MessageSceneへ遷移
- [ ] H-5-2. src/scenes/ChallengePlayingScene.ts新規作成
  - [ ] IScene実装
  - [ ] ChallengeModeView統合
  - [ ] update(): State確認（cleared/gameOver → ResultScene）
  - [ ] draw(): ChallengeModeView.draw()呼び出し
  - [ ] onEnter(): ViewボタンOFF
  - [ ] onExit(): ViewボタンON
- [ ] H-5-3. MessageScene/CountdownScene統合確認（既存）
- [ ] H-5-4. ビルド確認

### H-6. HTML/CSS更新
**目標:** モード選択ボタン追加

- [ ] H-6-1. index.html
  - [ ] `<button id="testModeButton" class="mode-button mode-button--test">Test Mode</button>`追加
  - [ ] `<button id="challengeModeButton" class="mode-button mode-button--challenge">Challenge Mode</button>`追加
- [ ] H-6-2. css/style.css
  - [ ] `.mode-button`スタイル追加（共通）
  - [ ] `.mode-button--test`スタイル追加（緑、top: 40%）
  - [ ] `.mode-button--challenge`スタイル追加（オレンジ、top: 55%）
  - [ ] hover効果（scale(1.05)）
- [ ] H-6-3. ビルド確認

### H-7. SceneManager更新
**目標:** mode context追加、SceneType拡張

- [ ] H-7-1. src/scenes/SceneManager.ts修正
  - [ ] SceneType拡張: 'modeSelect' | 'testIdle' | 'challengeIdle' | 'challengePlaying'追加
  - [ ] GameMode型追加: 'test' | 'challenge'
  - [ ] setMode(mode)メソッド追加
  - [ ] getMode()メソッド追加
  - [ ] currentMode: GameMode = 'test' プロパティ追加
- [ ] H-7-2. ビルド確認

### H-8. main.ts統合
**目標:** 全シーン登録、初期シーンをModeSelectに変更

- [ ] H-8-1. main.ts修正
  - [ ] ModeSelectScene import
  - [ ] TestIdleScene import
  - [ ] ChallengeIdleScene import
  - [ ] ChallengePlayingScene import
  - [ ] ChallengeModeView import
  - [ ] ModeSelectSceneインスタンス作成
  - [ ] TestIdleSceneインスタンス作成
  - [ ] ChallengeIdleSceneインスタンス作成
  - [ ] ChallengePlayingSceneインスタンス作成
  - [ ] sceneManager.addScene('modeSelect', modeSelectScene)
  - [ ] sceneManager.addScene('testIdle', testIdleScene)
  - [ ] sceneManager.addScene('challengeIdle', challengeIdleScene)
  - [ ] sceneManager.addScene('challengePlaying', challengePlayingScene)
  - [ ] sceneManager.switchTo('modeSelect') // 初期シーン変更
- [ ] H-8-2. testModeButton/challengeModeButtonイベントリスナー追加
- [ ] H-8-3. ビルド確認

### H-9. 統合テスト（ブラウザ）
**目標:** 両モード全フロー動作確認

- [ ] H-9-1. ModeSelect画面表示確認
- [ ] H-9-2. Test Modeボタン → TestIdleScene → PlayingScene → ResultScene
- [ ] H-9-3. Test Mode: View切替（Plant/Visualizer/Fractal）確認
- [ ] H-9-4. Test Mode: Easy Mode動作確認
- [ ] H-9-5. Challenge Modeボタン → ChallengeIdleScene → MessageScene → CountdownScene → ChallengePlayingScene
- [ ] H-9-6. Challenge Mode: ChallengeModeView描画確認（Plant中央、Visualizer×2背景）
- [ ] H-9-7. Challenge Mode: Voice continuity検出確認（30フレーム = 0.5秒で植物リセット）
- [ ] H-9-8. Challenge Mode: Clear/GameOver動作確認
- [ ] H-9-9. Result → Back → ModeSelectへ戻る確認
- [ ] H-9-10. パフォーマンス確認（60fps維持）

---

**Phase H完了条件:**
- Test Mode/Challenge Modeが正常動作
- ChallengeModeView描画正常（Plant中央、Visualizer×2背景）
- Voice continuity検出正常（0.5秒途切れでリセット）
- Mode選択 → ゲーム → Result → Mode選択の循環動作

---

### Phase C: サウンドシステム
**優先度:** ★☆☆（体験向上、実装容易）
**目標:** SoundManager + 7種効果音（Web Audio API合成音）

- [ ] C-1. SoundManager.ts実装（Web Audio API版）
  - [ ] C-1-1. クラス定義（audioContext, sounds Map）
  - [ ] C-1-2. playBeep(frequency, duration, type)実装
  - [ ] C-1-3. playSynthetic(soundType)実装（switch分岐）
  - [ ] C-1-4. play(soundType)実装（外部MP3 or synthetic）
  - [ ] C-1-5. ビルド確認

- [ ] C-2. 効果音定義
  - [ ] C-2-1. button-click: 440Hz, 0.1秒, sine
  - [ ] C-2-2. countdown-3: 220Hz, 0.5秒, square
  - [ ] C-2-3. countdown-2: 330Hz, 0.5秒, square
  - [ ] C-2-4. countdown-1: 440Hz, 0.5秒, square
  - [ ] C-2-5. countdown-start: 880→440Hz, 1.0秒, sawtooth（スウィープ）
  - [ ] C-2-6. goal-reached: アルペジオ（C-E-G-C、各0.3秒）
  - [ ] C-2-7. result: ホワイトノイズ、2.0秒

- [ ] C-3. シーン統合
  - [ ] C-3-1. OpeningScene: Startボタンクリック → button-click
  - [ ] C-3-2. CountdownScene: 3→2→1→START! で各効果音
  - [ ] C-3-3. PlayingScene: ゴール到達 → goal-reached
  - [ ] C-3-4. ResultScene: 表示前 → result
  - [ ] C-3-5. ビルド確認

- [ ] C-4. 動作テスト（ブラウザ）
  - [ ] C-4-1. 各効果音が正しいタイミングで再生されることを確認
  - [ ] C-4-2. 音量・長さ調整（必要に応じて）
  - [ ] C-4-3. Safari互換性確認

### Phase D: デシベル表示
**優先度:** ★☆☆（UX向上、単純実装）
**目標:** Canvas内にリアルタイムdB表示

- [ ] D-1. audio.tsにdB計算追加
  - [ ] D-1-1. getDecibels()メソッド実装
  - [ ] D-1-2. 計算式: `20 * Math.log10(smoothed + 1e-6)`
  - [ ] D-1-3. クランプ（-60dB ~ 0dB）
  - [ ] D-1-4. ビルド確認

- [ ] D-2. DecibelDisplay.ts実装（UI要素）
  - [ ] D-2-1. draw(p, decibels)実装
  - [ ] D-2-2. Canvas右上に表示（例: "Volume: -12.5 dB"）
  - [ ] D-2-3. フォント: Courier New, 16px, ネオン緑
  - [ ] D-2-4. 背景: 半透明黒、角丸矩形
  - [ ] D-2-5. ビルド確認

- [ ] D-3. PlayingScene統合
  - [ ] D-3-1. DecibelDisplayインスタンス作成
  - [ ] D-3-2. draw()内でdecibelDisplay.draw(p, decibels)
  - [ ] D-3-3. VisualizerViewにも統合
  - [ ] D-3-4. ビルド確認

- [ ] D-4. 動作テスト（ブラウザ）
  - [ ] D-4-1. 音量に応じてdB値が変化することを確認
  - [ ] D-4-2. 表示位置・スタイリング調整
  - [ ] D-4-3. 全Viewで正しく表示されることを確認

### Phase E: ムービーシステム ✅
**優先度:** ★★☆（v1.5実装完了）
**目標:** VideoPlayer + Result動画（Clear/GameOver）

- [x] E-1. VideoPlayer.ts実装 ✅
  - [x] E-1-1. クラス定義（videoElement, isLoaded, onCompleteCallback）
  - [x] E-1-2. preload(videoType)実装（事前読み込み）
  - [x] E-1-3. play(result, onComplete)実装（7秒動画再生）
  - [x] E-1-4. stop()実装（動画停止・非表示）
  - [x] E-1-5. ビルド確認 ✅

- [x] E-2. ムービー統合 ✅
  - [x] E-2-1. HTML: `<video id="resultVideo">` 要素追加
  - [x] E-2-2. CSS: .result-video スタイル追加（フェード演出）
  - [x] E-2-3. ResultScene: clear.mp4 → Retry画面遷移
  - [x] E-2-4. ResultScene: gameover.mp4 → Retry画面遷移
  - [x] E-2-5. ビルド確認 ✅（1.5mb, 683ms）

- [x] E-3. 動画アセット配置 ✅
  - [x] E-3-1. public/videos/ ディレクトリ作成
  - [x] E-3-2. clear.mp4 / gameover.mp4 配置準備（README.md作成）
  - [x] E-3-3. 動画なし時のエラーハンドリング実装

- [ ] E-4. 動作テスト（ユーザー側で実施）
  - [ ] E-4-1. 動画ファイル配置（public/videos/clear.mp4, gameover.mp4）
  - [ ] E-4-2. Clear時: 動画 → Retry画面遷移確認
  - [ ] E-4-3. GameOver時: 動画 → Retry画面遷移確認
  - [ ] E-4-4. 遅延なく演出開始することを確認

### Phase F: v1.4最終調整
**優先度:** ★★☆（リリース前必須）
**目標:** ドキュメント更新、パフォーマンス検証、テスト完了

- [ ] F-1. README.md更新（v1.4新機能）
  - [ ] F-1-1. オープニング画面、カウントダウン演出
  - [ ] F-1-2. MAX-based成長システム
  - [ ] F-1-3. 音量閾値検出、結果判定
  - [ ] F-1-4. デシベル表示
  - [ ] F-1-5. 効果音7種
  - [ ] F-1-6. ビルド確認

- [ ] F-2. ARCHITECTURE.md更新（v1.4設計図）
  - [ ] F-2-1. シーンシステム図
  - [ ] F-2-2. GameFlowController/GrowthSystem説明
  - [ ] F-2-3. アセット管理方針
  - [ ] F-2-4. ビルド確認

- [ ] F-3. パフォーマンス最適化
  - [ ] F-3-1. Chrome DevToolsでフレームレート確認
  - [ ] F-3-2. 効果音再生の負荷確認
  - [ ] F-3-3. シーン遷移の遅延確認
  - [ ] F-3-4. 60fps維持確認

- [ ] F-4. ブラウザテスト
  - [ ] F-4-1. Chrome/Edge: 全機能動作確認
  - [ ] F-4-2. Safari: AudioContext互換性確認
  - [ ] F-4-3. モバイル: レスポンシブ確認

- [ ] F-5. ビルド最終確認
  - [ ] F-5-1. npm run build成功
  - [ ] F-5-2. dist/bundle.js生成確認
  - [ ] F-5-3. エラーゼロ確認

---

## 📌 v1.4 完了条件
- [ ] オープニング→カウントダウン→ゲーム→結果のフロー完動
- [ ] MAX-based成長システムが正常動作（音量MAX維持→成長）
- [ ] 音量閾値検出でゲーム終了判定（60フレーム連続で終了）
- [ ] デシベル表示がCanvas内に表示される
- [ ] 効果音7種が適切なタイミングで再生される（Web Audio API合成）
- [ ] 全ブラウザ動作確認（Chrome, Edge, Safari）
- [ ] 60fps維持確認（Chrome DevTools）

---

## 🔮 将来バージョン（v1.5以降）

### v1.5: Canvas 2D最適化（オプション）
**目標:** createGraphics()事前レンダリングで粒子数500個
- [ ] ParticleSystem.tsに事前レンダリング実装
- [ ] パフォーマンステスト（60fps維持確認）

### v1.6: WebGL演出強化（長期計画）
**目標:** 3D演出、カメラワーク、ライティング
**参照:** WEBGL_IDEAS.md（10個のアイデア詳細）
- [ ] ダイナミックカメラワーク（音量連動ズーム）
- [ ] ダイナミックライティング（周波数で色変化）
- [ ] 3D粒子トルネード（螺旋上昇）
- [ ] 深度フォグ（奥行き表現）

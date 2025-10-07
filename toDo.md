# Voice Plant App - 実装チェックリスト

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

## フェーズ16: 状態管理実装（v1.0核心機能）
**目標:** Clear後に植物完成状態を維持、継続エフェクト

### 16-A: 型定義・基盤
- [ ] 16-A-1. types.tsに`PlantState = 'growing' | 'cleared'`追加
- [ ] 16-A-2. IViewインターフェースに`setClearThreshold?(threshold: number)`追加
- [ ] 16-A-3. PlantView.tsに`plantState`と`clearedHeight`プロパティ追加
- [ ] 16-A-4. FractalPlantView.tsにも同様の追加

### 16-B: 状態遷移ロジック
- [ ] 16-B-1. PlantView.update()を状態分岐に改修（`if (plantState === 'growing')`）
- [ ] 16-B-2. `transitionToCleared()`メソッド実装（clearedHeight保存、状態変更）
- [ ] 16-B-3. `updateClearedEffects()`メソッド実装（継続粒子生成、高さ固定）
- [ ] 16-B-4. FractalPlantView.update()も同様に改修
- [ ] 16-B-5. 型チェック確認（tsc --noEmit）

### 16-C: Clear後の継続エフェクト
- [ ] 16-C-1. ParticleSystem.tsに`generateContinuous()`メソッド追加（1-2個/フレーム、上限20）
- [ ] 16-C-2. PlantView.updateClearedEffects()で継続生成呼び出し
- [ ] 16-C-3. 花びら降下の視覚確認（cleared状態で常時降下）
- [ ] 16-C-4. FractalPlantViewにも統合

### 16-D: テスト
- [ ] 16-D-1. PlantViewで状態遷移確認（growing → cleared）
- [ ] 16-D-2. cleared後に音量変化で高さが変わらないことを確認
- [ ] 16-D-3. 継続粒子が20個上限で動作確認
- [ ] 16-D-4. FractalPlantViewでも同様のテスト

## フェーズ17: Clearライン調整UI
**目標:** スライダーで目標値を0.5-1.0で調整可能

### 17-A: ViewManager拡張
- [ ] 17-A-1. ViewManager.tsに`setClearThreshold(threshold: number)`メソッド追加
- [ ] 17-A-2. currentViewに対してsetClearThreshold呼び出し（オプショナルチェイン）
- [ ] 17-A-3. View切替時にclearThreshold値を保持・引き継ぎ

### 17-B: PlantView側の実装
- [ ] 17-B-1. PlantView.tsに`setClearThreshold(threshold: number)`実装（0.5-1.0クランプ）
- [ ] 17-B-2. 壁のY座標計算を`this.clearThreshold`ベースに変更
- [ ] 17-B-3. FractalPlantView.tsにも実装
- [ ] 17-B-4. ビルド確認

### 17-C: HTML/CSS実装（仮配置）
- [ ] 17-C-1. index.htmlに`<input type="range" id="clearSlider">`追加（min=0.5, max=1.0, step=0.05）
- [ ] 17-C-2. `<span id="thresholdValue">`でリアルタイム表示
- [ ] 17-C-3. 仮スタイリング（後でコンソールに移動）

### 17-D: main.ts統合
- [ ] 17-D-1. main.tsでclearSliderイベントリスナー設定
- [ ] 17-D-2. スライダー変更時にviewManager.setClearThreshold()呼び出し
- [ ] 17-D-3. thresholdValue更新（toFixed(2)）
- [ ] 17-D-4. 動作確認（スライダー操作で壁が移動）

## フェーズ18: コンソールUI実装
**目標:** Canvas外に専用UIエリア、デバッグ情報・コントロール集約

### 18-A: HTMLレイアウト変更
- [ ] 18-A-1. index.htmlを`app-container > canvas-area + console-area`構造に変更
- [ ] 18-A-2. canvas-areaに既存のCanvas要素移動
- [ ] 18-A-3. console-areaに以下セクション追加：
  - `console-header`（タイトル）
  - `debug-info`（音量、周波数、高さ、Clear状態）
  - `controls`（Viewボタン、Easy Mode、Clearスライダー）
- [ ] 18-A-4. 既存UI要素（viewButtons, easyModeContainer等）をconsole-areaに移動

### 18-B: CSS Grid/Flexboxレイアウト
- [ ] 18-B-1. `.app-container { display: grid; grid-template-columns: 1fr 300px; }`
- [ ] 18-B-2. モバイル対応（@media (max-width: 768px)で縦積み）
- [ ] 18-B-3. canvas-areaを100%高さ、console-areaをスクロール可能に
- [ ] 18-B-4. レイアウト動作確認（デスクトップ・モバイル）

### 18-C: コンソールスタイリング（SF風）
- [ ] 18-C-1. 背景: `rgba(0, 0, 30, 0.9)`（半透明ダークブルー）
- [ ] 18-C-2. テキスト: `color: #00D9FF`（ネオン青）、フォント: Roboto Mono
- [ ] 18-C-3. グローエフェクト: `text-shadow: 0 0 10px rgba(0, 217, 255, 0.8)`
- [ ] 18-C-4. ボーダー: `border-left: 2px solid #00D9FF`
- [ ] 18-C-5. スライダー・ボタンのカスタムスタイル（ネオン青アクセント）

### 18-D: デバッグ情報DOM更新
- [ ] 18-D-1. main.tsでDOM要素取得（volumeValue, freqValue, heightValue, clearStateValue）
- [ ] 18-D-2. draw()内でDOM要素の`textContent`更新（60fps）
- [ ] 18-D-3. PlantView/FractalPlantViewからCanvas描画のデバッグテキスト削除
- [ ] 18-D-4. 動作確認（数値がリアルタイム更新）

## フェーズ19: v1.0最終調整
**目標:** 全機能統合、パフォーマンス最適化、UX改善

### 19-A: パフォーマンス最適化
- [ ] 19-A-1. Clear後粒子生成を軽量化（条件分岐で不要な計算削減）
- [ ] 19-A-2. Simplexノイズの最適化確認（グローバルインスタンス再利用）
- [ ] 19-A-3. Chrome DevToolsでフレームレート確認（60fps維持）

### 19-B: UX改善
- [ ] 19-B-1. Clearライン初期値0.8の妥当性確認（Easy Modeで0.5推奨？）
- [ ] 19-B-2. Clear後メッセージの表示時間調整（2秒→3秒？）
- [ ] 19-B-3. 継続粒子の色バリエーション確認（花色5種）
- [ ] 19-B-4. コンソールUIの視認性確認（文字サイズ、コントラスト）

### 19-C: 全モードテスト
- [ ] 19-C-1. PlantView（通常）: 成長→Clear→cleared状態確認
- [ ] 19-C-2. PlantView（Easy Mode）: 10倍増幅、Clear動作確認
- [ ] 19-C-3. FractalPlantView（通常）: 累積成長→Clear→cleared状態確認
- [ ] 19-C-4. FractalPlantView（Easy Mode）: 10倍増幅、Clear動作確認
- [ ] 19-C-5. VisualizerView: 影響なし確認（Clear無関係）
- [ ] 19-C-6. Clearスライダー: 0.5/0.7/1.0で動作確認

### 19-D: レスポンシブ・互換性
- [ ] 19-D-1. モバイルレイアウト確認（縦積み、タッチ操作）
- [ ] 19-D-2. Safari互換性確認（AudioContext.suspended対応）
- [ ] 19-D-3. 画面サイズ変更（windowResized）対応確認

## フェーズ20: v1.0リリース準備
- [ ] 20-1. README.md更新（v1.0新機能、使い方）
- [ ] 20-2. ARCHITECTURE.md更新（v1.0設計図追記）
- [ ] 20-3. vercel.json確認（デプロイ設定）
- [ ] 20-4. ビルド最終確認（npm run build、エラーゼロ）
- [ ] 20-5. Vercelデプロイ＆動作確認

---

## v1.0.5: Canvas 2D最適化（v1.0完成後、即時実装可）
**目標:** 既存コードそのままで粒子数150→500個

- [ ] 21-1. ParticleSystem.tsに`particleGraphic`プロパティ追加（p5.Graphics型）
- [ ] 21-2. draw()内でcreateGraphics()による事前レンダリング実装
- [ ] 21-3. circle()描画をimage()描画に置き換え
- [ ] 21-4. グローエフェクト（2重円）を最適化版に移植
- [ ] 21-5. バースト粒子数を150→300に増量テスト
- [ ] 21-6. 継続粒子を20→50に増量テスト
- [ ] 21-7. パフォーマンステスト（Chrome DevTools、60fps維持確認）
- [ ] 21-8. 全View（Plant/Fractal）で動作確認

**完了条件:** 粒子500個でも60fps安定維持

---

## v1.1: WebGL移行 + 3D演出（v1.0.5完成後）
**目標:** GPU並列処理で粒子10000個、3D表現追加

### Phase 1: WEBGL基盤（互換性保証）
- [ ] 22-1. Git feature branchでWebGL実験開始
- [ ] 22-2. main.tsで`p.createCanvas(800, 600, p.WEBGL)`に変更
- [ ] 22-3. PlantView.draw()に`p.translate(-p.width/2, -p.height/2)`追加
- [ ] 22-4. FractalPlantView.draw()に`p.translate(-p.width/2, -p.height/2)`追加
- [ ] 22-5. VisualizerView.draw()に`p.translate(-p.width/2, -p.height/2)`追加
- [ ] 22-6. 基本動作確認（植物が表示されるか）
- [ ] 22-7. 座標ズレ修正（必要に応じてutils.tsにtoWebGL()追加）
- [ ] 22-8. 全Viewで描画位置が正しいことを確認

### Phase 2: 粒子3D化
- [ ] 22-9. ParticleSystem.draw()をWEBGL版に改修（translate+sphere）
- [ ] 22-10. 粒子サイズ調整（circle→sphereで見た目維持）
- [ ] 22-11. 粒子色・透明度が正しく表示されることを確認
- [ ] 22-12. グローエフェクトをWEBGL版に移植（ambientLight使用）
- [ ] 22-13. 粒子数を500→1000に増量テスト
- [ ] 22-14. 粒子数を1000→5000に増量テスト
- [ ] 22-15. 粒子数を5000→10000に増量テスト（限界値確認）

### Phase 3: 3D演出追加
- [ ] 22-16. directionalLight追加（ライティング基本）
- [ ] 22-17. 粒子にrotateZ()追加（回転アニメーション）
- [ ] 22-18. カメラワーク実験（zoom in/out）
- [ ] 22-19. 3D植物の可能性検証（茎を円柱、葉を板ポリゴン）
- [ ] 22-20. シェーダー実験（カスタムグロー）

### Phase 4: 安定化・最適化
- [ ] 22-21. ブラウザ互換性テスト（Chrome, Edge, Firefox, Safari）
- [ ] 22-22. モバイル動作確認（Android Chrome, iOS Safari）
- [ ] 22-23. WebGL非対応時のフォールバック実装（Canvas 2Dに自動切替）
- [ ] 22-24. パフォーマンスプロファイリング（GPU使用率確認）
- [ ] 22-25. ロールバックテスト（2行削除で元に戻ることを確認）
- [ ] 22-26. v1.1リリース判断（問題なければmainマージ）

**完了条件:** 粒子10000個で60fps維持、全ブラウザ動作

---

## v1.2: エフェクト強化（WebGLベース、v1.1完成後）
- [ ] 23-1. 花びら形状（SVGパス → 3Dメッシュ）
- [ ] 23-2. 光の粒子（星型パーティクル）
- [ ] 23-3. コンクリートテクスチャ（Simplexノイズ）
- [ ] 23-4. ひび割れアニメーション（徐々に拡大）
- [ ] 23-5. 破片エフェクト（物理演算）

## 完了条件
- [ ] マイク許可が正常に動作する
- [ ] 円形FFTビジュアライザーが16バンドで動作する
- [ ] 周波数帯域ごとに青→緑→赤の色変化が表示される
- [ ] 切り替えボタンで植物モード/ビジュアライザーモードが切り替わる
- [ ] 植物モード: 音量で茎が0-400px伸び縮みする
- [ ] 植物モード: 周波数で葉が2-8枚に分岐する
- [ ] 植物モード: 音量0.8以上で"Clear!"と粒子とひび割れが表示される
- [ ] モバイルブラウザでも動作する

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

## フェーズ11-14統合: Clear!エフェクトシステム（プロトタイプ）
**目標:** PlantViewとFractalPlantViewでClear!を実装。モジュール化優先。

### 11-A: エフェクトモジュール作成
- [ ] 11-A-1. effects/Particle.ts作成（位置・速度・life管理）
- [ ] 11-A-2. effects/ParticleSystem.ts作成（burst/update/draw）
- [ ] 11-A-3. effects/ConcreteEffect.ts作成（背景・ひび割れ）
- [ ] 11-A-4. 各モジュールの型定義を確認

### 11-B: Clear!メッセージ（DOM操作）
- [ ] 11-B-1. index.htmlにclearMessage要素追加
- [ ] 11-B-2. PlantView.tsにclearTriggeredフラグ追加
- [ ] 11-B-3. volume > 0.8判定でshowClearMessage()実行
- [ ] 11-B-4. 2秒後にフラグリセット
- [ ] 11-B-5. FractalPlantView.tsにも同様の実装

### 11-C: 粒子エフェクト統合
- [ ] 11-C-1. PlantViewにParticleSystemインスタンス追加
- [ ] 11-C-2. Clear!時にparticles.burst()実行
- [ ] 11-C-3. update()でparticles.update()呼び出し
- [ ] 11-C-4. draw()でparticles.draw()呼び出し
- [ ] 11-C-5. FractalPlantViewにも統合

### 11-D: コンクリートエフェクト統合
- [ ] 11-D-1. PlantViewにConcreteEffectインスタンス追加
- [ ] 11-D-2. draw()の最初でconcrete.drawBackground()
- [ ] 11-D-3. Clear!時にconcrete.crack()実行
- [ ] 11-D-4. draw()でconcrete.drawCracks()呼び出し
- [ ] 11-D-5. 茎の基点をheight*0.7に調整
- [ ] 11-D-6. FractalPlantViewにも統合

### 11-E: 統合テスト
- [ ] 11-E-1. PlantViewでClear!動作確認
- [ ] 11-E-2. FractalPlantViewでClear!動作確認
- [ ] 11-E-3. Easy Modeで両Viewテスト
- [ ] 11-E-4. ビルド＆ブラウザテスト

## フェーズ15: 最終調整
- [ ] 15-1. Simplexノイズで茎の揺らぎを追加
- [ ] 15-2. 葉のサイズをvolume連動に変更
- [ ] 15-3. 色の彩度・明度を調整
- [ ] 15-4. レスポンシブ対応（windowResized）を確認
- [ ] 15-5. 全体の動作を最終確認

## 完了条件
- [ ] マイク許可が正常に動作する
- [ ] 円形FFTビジュアライザーが16バンドで動作する
- [ ] 周波数帯域ごとに青→緑→赤の色変化が表示される
- [ ] 切り替えボタンで植物モード/ビジュアライザーモードが切り替わる
- [ ] 植物モード: 音量で茎が0-400px伸び縮みする
- [ ] 植物モード: 周波数で葉が2-8枚に分岐する
- [ ] 植物モード: 音量0.8以上で"Clear!"と粒子とひび割れが表示される
- [ ] モバイルブラウザでも動作する

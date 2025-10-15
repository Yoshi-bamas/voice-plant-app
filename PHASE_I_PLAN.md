# Phase I: UI/UX改善計画（v1.5.1）

**目標:** Canvas内UI統一、Challenge Mode待機画面改善、視覚フィードバック強化

---

## 📋 問題点サマリー

| 問題ID | 問題内容 | 影響度 | 優先度 |
|--------|---------|--------|--------|
| **I-1** | ModeSelectボタンがCanvas外（HTML） | ★★★ | 最優先 |
| **I-2** | Challenge ModeでStart/Challenge分離 | ★★★ | 最優先 |
| **I-3** | ChallengeIdle画面でPlant未描画 | ★★☆ | 高 |
| **I-4** | 植物が音量で揺れ動かない | ★★☆ | 高 |

---

## 🎨 新仕様

### I-1: Canvas内クリック判定（ModeSelect）

**変更内容:**
- HTMLボタン削除（`testModeButton` / `challengeModeButton`）
- Canvas内に矩形領域を描画 + マウスクリック判定

**実装:**
```typescript
// ModeSelectScene.ts
draw(p: p5): void {
    // Test Modeボタン描画（中央やや上）
    this.drawButton(p, p.width / 2, p.height / 2 - 60, 200, 60, 'Test Mode', '#00ff00');

    // Challenge Modeボタン描画（中央やや下）
    this.drawButton(p, p.width / 2, p.height / 2 + 60, 200, 60, 'Challenge Mode', '#ffaa00');
}

// Canvas内クリック判定
p.mousePressed = () => {
    if (sceneManager.getCurrentSceneName() === 'modeSelect') {
        modeSelectScene.handleMouseClick(p.mouseX, p.mouseY);
    }
};
```

**メリット:**
- Canvas描画に統一
- p5.jsネイティブな体験
- HTMLボタン不要

---

### I-2: CHALLENGE STARTボタン統合

**変更内容:**
- `startButton` + `challengeButton` を削除
- **"CHALLENGE START"ボタン**をCanvas下部に1つだけ配置
- クリック時の処理:
  1. マイク未初期化 → AudioAnalyzer初期化
  2. マイク初期化済み → MessageScene → CountdownScene → ChallengePlayingScene

**ボタン配置:**
```
┌──────────────────────────────┐
│                              │
│   ChallengeModeView描画      │
│   (Plant + Visualizer×2)     │
│                              │
│                              │
├──────────────────────────────┤
│    [CHALLENGE START]         │ ← Canvas下部（y = 550）
└──────────────────────────────┘
```

**実装:**
```typescript
// ChallengeIdleScene.ts
draw(p: p5): void {
    // ChallengeModeViewを描画（音量反応あり）
    this.challengeModeView.draw(p);

    // Canvas下部にボタン描画
    this.drawChallengeStartButton(p);
}

handleMouseClick(x: number, y: number): void {
    // ボタン領域判定（y: 530-570）
    if (y >= 530 && y <= 570 && x >= 300 && x <= 500) {
        if (!isAudioInitialized) {
            // マイク初期化
            await this.initializeAudio();
        }
        // MessageSceneへ遷移
        this.sceneManager.switchTo('message');
    }
}
```

---

### I-3: ChallengeIdle画面でChallengeModeView使用

**変更内容:**
- ChallengeIdleScene.tsで**ChallengeModeView**を使用
- Idle時もPlant + Visualizer×2を描画
- 音量に応じて植物が揺れ動く（成長なし）

**Before（問題あり）:**
```typescript
// ChallengeIdleScene.ts
private visualizerView: VisualizerView;  // Visualizerのみ
```

**After（改善）:**
```typescript
// ChallengeIdleScene.ts
private challengeModeView: ChallengeModeView;  // Plant + Visualizer×2

update(audioAnalyzer?: AudioAnalyzer): void {
    if (audioAnalyzer) {
        // 音量反応あり、成長なし
        this.challengeModeView.updatePreview(audioAnalyzer);
    }
}

draw(p: p5): void {
    this.challengeModeView.draw(p);
}
```

---

### I-4: 植物が音量で揺れ動く（EasyMode相当）

**変更内容:**
- ChallengeModeView.updatePreview()メソッド追加
- **Idle時専用の更新処理**（成長なし、視覚フィードバックのみ）

**仕様:**
- 音量 → 植物の高さに即座反映（EasyMode相当、増幅あり）
- GrowthSystemは使用しない（蓄積なし）
- Simplexノイズによる揺らぎは継続
- Visualizer×2も音声に反応

**実装:**
```typescript
// ChallengeModeView.ts
updatePreview(audioAnalyzer: AudioAnalyzer): void {
    const volume = audioAnalyzer.getVolume();

    // EasyMode相当: 音量を増幅して即座に高さへ反映
    const amplifiedVolume = Math.min(volume * 2.5, 1.0);

    // PlantViewの内部状態を直接更新（成長システムをバイパス）
    this.plantView.setPreviewHeight(amplifiedVolume);

    // Visualizer更新
    this.visualizerLeft.update(audioAnalyzer);
    this.visualizerRight.update(audioAnalyzer);
}
```

```typescript
// PlantView.ts
// v1.5.1: プレビューモード用メソッド追加
setPreviewHeight(volume: number): void {
    // 音量を直接高さに変換（0-1 → 0-400px）
    this.smoothedVolume = volume;
    // GrowthSystemは使用しない（Idle時のみ）
}
```

---

## 🏗️ 実装手順

### Phase I-1: Canvas内クリック判定実装 ✅（計画）
**ファイル:** `src/scenes/ModeSelectScene.ts`

- [ ] I-1-1. HTMLボタン削除（testModeButton/challengeModeButtonイベントリスナー削除）
- [ ] I-1-2. drawButton()メソッド実装（矩形・テキスト描画）
- [ ] I-1-3. handleMouseClick()メソッド実装（領域判定）
- [ ] I-1-4. main.tsでp.mousePressed()追加（全シーン共通ハンドラー）
- [ ] I-1-5. ビルド確認

### Phase I-2: CHALLENGE STARTボタン統合 ✅（計画）
**ファイル:** `src/scenes/ChallengeIdleScene.ts`, `src/main.ts`

- [ ] I-2-1. ChallengeIdleScene: startButton/challengeButton削除
- [ ] I-2-2. drawChallengeStartButton()メソッド実装（Canvas下部描画）
- [ ] I-2-3. handleMouseClick()実装（マイク初期化 + 遷移）
- [ ] I-2-4. main.ts: initializeAudio()をグローバル関数化（シーンから呼び出し可能に）
- [ ] I-2-5. ビルド確認

### Phase I-3: ChallengeIdleでChallengeModeView使用 ✅（計画）
**ファイル:** `src/scenes/ChallengeIdleScene.ts`

- [ ] I-3-1. visualizerView削除、challengeModeView追加
- [ ] I-3-2. update()でchallengeModeView.updatePreview()呼び出し
- [ ] I-3-3. draw()でchallengeModeView.draw()呼び出し
- [ ] I-3-4. ビルド確認

### Phase I-4: PlantView.setPreviewHeight()実装 ✅（計画）
**ファイル:** `src/PlantView.ts`, `src/views/ChallengeModeView.ts`

- [ ] I-4-1. PlantView.setPreviewHeight()メソッド追加
- [ ] I-4-2. ChallengeModeView.updatePreview()メソッド追加
- [ ] I-4-3. EasyMode相当の音量増幅（×2.5）
- [ ] I-4-4. ビルド確認

### Phase I-5: HTML/CSS整理 ✅（計画）
**ファイル:** `index.html`, `css/style.css`

- [ ] I-5-1. testModeButton/challengeModeButton削除（HTML）
- [ ] I-5-2. mode-buttonスタイル削除（CSS）
- [ ] I-5-3. ビルド確認

### Phase I-6: 統合テスト ✅（計画）
- [ ] I-6-1. ModeSelect: Canvas内ボタンクリック確認
- [ ] I-6-2. Test Mode: フロー確認
- [ ] I-6-3. Challenge Mode: CHALLENGE STARTボタン動作確認
- [ ] I-6-4. ChallengeIdle: Plant + Visualizer×2描画確認
- [ ] I-6-5. ChallengeIdle: 音量で植物が揺れ動く確認
- [ ] I-6-6. パフォーマンス確認（60fps維持）

---

## 📊 変更ファイル一覧

| ファイル | 変更内容 | 難易度 |
|---------|---------|--------|
| **src/scenes/ModeSelectScene.ts** | Canvas内ボタン描画、クリック判定 | ★★☆ |
| **src/scenes/ChallengeIdleScene.ts** | ChallengeModeView統合、CHALLENGE STARTボタン | ★★☆ |
| **src/views/ChallengeModeView.ts** | updatePreview()追加 | ★☆☆ |
| **src/PlantView.ts** | setPreviewHeight()追加 | ★☆☆ |
| **src/main.ts** | mousePressed()追加、initializeAudio()公開 | ★★☆ |
| **index.html** | testModeButton/challengeModeButton削除 | ★☆☆ |
| **css/style.css** | mode-buttonスタイル削除 | ★☆☆ |

---

## 🎯 完成イメージ

### ModeSelect画面
```
┌────────────────────────────────┐
│    Voice Plant App             │
│    Select Mode                 │
│                                │
│    ┌────────────┐              │
│    │ Test Mode  │ ← Canvas内矩形 │
│    └────────────┘              │
│                                │
│    ┌────────────────┐          │
│    │ Challenge Mode │          │
│    └────────────────┘          │
└────────────────────────────────┘
```

### ChallengeIdle画面
```
┌────────────────────────────────┐
│  Challenge Mode                │
│                                │
│  [Visualizer]  [Plant]         │ ← 音量で揺れ動く
│             [Visualizer]       │
│                                │
│  ⚠️ 声が0.5秒途切れるとリセット   │
├────────────────────────────────┤
│   [CHALLENGE START] ← Canvas内 │
└────────────────────────────────┘
```

---

## ✅ Phase I完了条件

- [ ] ModeSelectボタンがCanvas内で動作
- [ ] Challenge Modeで"CHALLENGE START"ボタン1つのみ
- [ ] ChallengeIdle画面でPlant + Visualizer×2描画
- [ ] 音量で植物が揺れ動く（EasyMode相当）
- [ ] 全フロー動作確認
- [ ] 60fps維持

---

**End of PHASE_I_PLAN.md**

# Voice Plant App - Mode System Design (v1.5)

**Version:** 1.5
**Date:** 2025-10-14
**Status:** Planning → Implementation

---

## 📋 Overview

v1.5では、**Test Mode**と**Challenge Mode**の2つのモードを追加し、ユーザーがゲーム開始前にモードを選択できるようにします。

### Mode Summary

| Mode | Description | View Layout | Rules | UI |
|------|-------------|-------------|-------|-----|
| **Test Mode** | 既存機能（自由実験） | View切替可（Plant/Visualizer/Fractal） | タイマーあり、Easy Mode可 | System Control完全版 |
| **Challenge Mode** | 連続発声チャレンジ | Plant中央固定 + Visualizer背景×2 | 声途切れ即リセット | System Control維持 |

---

## 🏗️ Architecture

### Scene Flow

#### 新フロー（v1.5）
```
ModeSelect (新規)
    ├─ Test Mode → TestIdleScene → (既存フロー)
    └─ Challenge Mode → ChallengeIdleScene → (v1.4.5フロー)
```

#### Test Mode Flow
```
ModeSelect
  ↓
TestIdleScene (VisualizerView)
  ↓
(StartButton) → マイク初期化
  ↓
PlayingScene (ViewManager: Plant/Visualizer/Fractal切替可)
  ↓
ResultScene
```

#### Challenge Mode Flow
```
ModeSelect
  ↓
ChallengeIdleScene (VisualizerView)
  ↓
(ChallengeButton) → MessageScene
  ↓
CountdownScene (3, 2, 1, START!)
  ↓
ChallengePlayingScene (ChallengeModeView固定)
  ↓
ResultScene
```

---

## 🎨 Challenge Mode Canvas Layout

### Canvas配置（800x600）

```
┌────────────────────────────────────────┐
│ ┌─────────────┐                        │
│ │ Visualizer  │        (空白)           │ ← 上部200px
│ │   Left      │                        │
│ │  (200x150)  │                        │
│ └─────────────┘                        │
├────────────────────────────────────────┤
│                                        │
│          Plant (中央)                   │ ← 中央200px
│        (400x200領域)                    │
│                                        │
├────────────────────────────────────────┤
│                        ┌─────────────┐ │
│          (空白)          │ Visualizer  │ │ ← 下部200px
│                        │   Right     │ │
│                        │  (200x150)  │ │
│                        └─────────────┘ │
└────────────────────────────────────────┘

System Control Panel (右側320px) → 既存維持
```

### Coordinates

| Element | Position | Size |
|---------|----------|------|
| **Visualizer Left** | (50, 50) | 200x150 |
| **Plant** | (200, 200) | 400x200 |
| **Visualizer Right** | (550, 400) | 200x150 |

**Note:** WEBGLモードのため、座標系変換が必要
```typescript
// WEBGLモード座標変換（中央が原点）
// Left: (-300, -250)
// Plant: (0, 0) ← 中央
// Right: (150, 100)
```

---

## 🔧 Implementation Plan

### Phase H: Mode Selection System

#### H-1. ModeSelectScene.ts 作成 ✅（計画）
**目標:** Test/Challenge選択画面

**実装内容:**
```typescript
export class ModeSelectScene implements IScene {
    private sceneManager: SceneManager;
    private testModeButton: HTMLButtonElement;
    private challengeModeButton: HTMLButtonElement;

    onEnter(): void {
        // ボタン表示
        this.testModeButton.style.display = 'block';
        this.challengeModeButton.style.display = 'block';

        // イベントリスナー
        this.testModeButton.addEventListener('click', () => {
            this.sceneManager.setMode('test');
            this.sceneManager.switchTo('testIdle');
        });

        this.challengeModeButton.addEventListener('click', () => {
            this.sceneManager.setMode('challenge');
            this.sceneManager.switchTo('challengeIdle');
        });
    }

    draw(p: p5): void {
        // タイトル: "Voice Plant App"
        // サブタイトル: "Select Mode"
        // 説明テキスト
    }
}
```

**ファイル:** `src/scenes/ModeSelectScene.ts`

#### H-2. ChallengeModeView.ts 作成 ✅（計画）
**目標:** Plant中央 + Visualizer×2背景配置

**実装内容:**
```typescript
export class ChallengeModeView implements IView {
    private plantView: PlantView;
    private visualizerLeft: VisualizerView;
    private visualizerRight: VisualizerView;
    private voiceContinuityDetector: VoiceContinuityDetector;

    constructor() {
        this.plantView = new PlantView();
        this.visualizerLeft = new VisualizerView();
        this.visualizerRight = new VisualizerView();
        this.voiceContinuityDetector = new VoiceContinuityDetector(0.1, 30);
    }

    update(audioAnalyzer: AudioAnalyzer): void {
        // Voice continuity detection
        const volume = audioAnalyzer.getVolume();
        this.voiceContinuityDetector.update(volume);

        if (this.voiceContinuityDetector.isVoiceLost()) {
            this.plantView.resetPlantHeight();
            this.plantView.transitionToGameOver();
        }

        // Update all views
        this.plantView.update(audioAnalyzer);
        this.visualizerLeft.update(audioAnalyzer);
        this.visualizerRight.update(audioAnalyzer);
    }

    draw(p: p5): void {
        // Background Visualizers (半透明)
        this.drawVisualizerLeft(p);
        this.drawVisualizerRight(p);

        // Main Plant (中央)
        this.drawPlantCenter(p);
    }

    private drawVisualizerLeft(p: p5): void {
        p.push();
        p.translate(-300, -250); // 左上配置（WEBGL座標）
        p.scale(0.5); // 縮小（200x150）
        p.tint(255, 128); // 半透明（opacity 0.5）
        this.visualizerLeft.draw(p);
        p.pop();
    }

    private drawVisualizerRight(p: p5): void {
        p.push();
        p.translate(150, 100); // 右下配置（WEBGL座標）
        p.scale(0.5);
        p.tint(255, 128);
        this.visualizerRight.draw(p);
        p.pop();
    }

    private drawPlantCenter(p: p5): void {
        p.push();
        p.translate(0, 0); // 中央配置
        this.plantView.draw(p);
        p.pop();
    }
}
```

**ファイル:** `src/views/ChallengeModeView.ts`

#### H-3. TestModeシーンフロー
**目標:** 既存IdleSceneを活用、Test Mode専用フロー構築

**変更内容:**
- `IdleScene.ts` → `TestIdleScene.ts`にリネーム
- ViewManager統合（既存動作維持）
- System Control完全版使用

**ファイル:**
- `src/scenes/TestIdleScene.ts`（IdleSceneからコピー）
- `src/scenes/PlayingScene.ts`（既存）

#### H-4. ChallengeModeシーンフロー
**目標:** ChallengePlayingScene作成

**実装内容:**
```typescript
export class ChallengePlayingScene implements IScene {
    private sceneManager: SceneManager;
    private challengeModeView: ChallengeModeView;
    private resultScene: ResultScene;

    constructor(sceneManager: SceneManager, resultScene: ResultScene) {
        this.sceneManager = sceneManager;
        this.challengeModeView = new ChallengeModeView();
        this.resultScene = resultScene;
    }

    onEnter(): void {
        // コンソールUI表示（ViewボタンはOFF）
        const viewButtons = document.getElementById('viewButtons');
        if (viewButtons) viewButtons.style.display = 'none';
    }

    update(audioAnalyzer?: AudioAnalyzer): void {
        if (audioAnalyzer) {
            this.challengeModeView.update(audioAnalyzer);

            // State check
            const plantState = this.challengeModeView.getPlantState();
            if (plantState === 'cleared') {
                this.resultScene.setResult('clear');
                this.sceneManager.switchTo('result');
            } else if (plantState === 'gameOver') {
                this.resultScene.setResult('gameover');
                this.sceneManager.switchTo('result');
            }
        }
    }

    draw(p: p5): void {
        this.challengeModeView.draw(p);
    }

    onExit(): void {
        // Viewボタン再表示
        const viewButtons = document.getElementById('viewButtons');
        if (viewButtons) viewButtons.style.display = 'flex';
    }
}
```

**ファイル:** `src/scenes/ChallengePlayingScene.ts`

#### H-5. HTML/CSS更新
**目標:** モード選択ボタン追加

**HTML追加:**
```html
<!-- index.html -->
<button id="testModeButton" class="mode-button mode-button--test">Test Mode</button>
<button id="challengeModeButton" class="mode-button mode-button--challenge">Challenge Mode</button>
```

**CSS追加:**
```css
/* css/style.css */
.mode-button {
    position: absolute;
    padding: 20px 40px;
    font-size: 24px;
    font-weight: bold;
    font-family: 'Courier New', Courier, monospace;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.mode-button--test {
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #0a0a0a;
    background: #00ff00;
    border: 3px solid #00ff00;
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
}

.mode-button--challenge {
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #0a0a0a;
    background: #ffaa00;
    border: 3px solid #ffaa00;
    box-shadow: 0 0 20px rgba(255, 170, 0, 0.5);
}

.mode-button:hover {
    transform: translate(-50%, -50%) scale(1.05);
}
```

#### H-6. SceneManager更新
**目標:** mode context追加、SceneType拡張

**変更内容:**
```typescript
// src/scenes/SceneManager.ts
export type SceneType =
    | 'modeSelect'           // 新規
    | 'testIdle'             // 新規
    | 'challengeIdle'        // 新規
    | 'idle'                 // 既存（非推奨、後方互換）
    | 'message'
    | 'opening'
    | 'countdown'
    | 'playing'
    | 'challengePlaying'     // 新規
    | 'result';

export type GameMode = 'test' | 'challenge';

export class SceneManager {
    private currentMode: GameMode = 'test';

    setMode(mode: GameMode): void {
        this.currentMode = mode;
        console.log(`[SceneManager] Mode set to: ${mode}`);
    }

    getMode(): GameMode {
        return this.currentMode;
    }
}
```

#### H-7. 統合テスト
**目標:** 両モード動作確認

**テスト項目:**
- [ ] ModeSelect画面表示
- [ ] Test Modeボタン → TestIdleScene → ViewManager動作
- [ ] Challenge Modeボタン → ChallengeIdleScene → ChallengeModeView描画
- [ ] ChallengeModeView: Plant中央、Visualizer×2背景配置確認
- [ ] Voice continuity検出動作（Challenge Mode）
- [ ] System Control表示（両モード）
- [ ] Result → Back → ModeSelectへ戻る

---

## 📐 Visualizer サイズ仕様

### Challenge Mode Visualizer

| Parameter | Value | Note |
|-----------|-------|------|
| **サイズ** | 200x150 | 元サイズ（800x600）の0.25倍 |
| **透明度** | 0.5 (opacity) | `p.tint(255, 128)` |
| **配置** | 左上・右下 | 対角配置 |
| **スタイル** | 背景的 | Plantを邪魔しない |

### 座標計算（WEBGL座標系）

```typescript
// Canvas: 800x600, WEBGL中央原点 (0, 0)

// Left Visualizer
const leftX = -400 + 50 + 100; // -250
const leftY = -300 + 50 + 75;  // -175

// Right Visualizer
const rightX = 400 - 50 - 100; // 250
const rightY = 300 - 50 - 75;  // 175
```

---

## 🔄 Existing Code Mapping

### Test Mode（既存機能活用）

| Component | File | Status |
|-----------|------|--------|
| IdleScene | `src/scenes/IdleScene.ts` | リネーム → TestIdleScene |
| PlayingScene | `src/scenes/PlayingScene.ts` | 既存維持 |
| ViewManager | `src/ViewManager.ts` | 既存維持 |
| System Control | `index.html`, `css/style.css` | 既存維持 |

### Challenge Mode（新規実装）

| Component | File | Status |
|-----------|------|--------|
| ChallengeModeView | `src/views/ChallengeModeView.ts` | 新規作成 |
| ChallengeIdleScene | `src/scenes/ChallengeIdleScene.ts` | 新規作成 |
| ChallengePlayingScene | `src/scenes/ChallengePlayingScene.ts` | 新規作成 |
| ModeSelectScene | `src/scenes/ModeSelectScene.ts` | 新規作成 |

---

## 📊 Implementation Checklist

### Phase H: Mode System Implementation

- [ ] **H-1. ModeSelectScene.ts作成**
  - [ ] IScene実装
  - [ ] Test/Challengeボタン表示
  - [ ] モード選択ハンドラー
  - [ ] タイトル・説明描画

- [ ] **H-2. ChallengeModeView.ts作成**
  - [ ] IView実装
  - [ ] PlantView統合
  - [ ] Visualizer×2統合
  - [ ] VoiceContinuityDetector統合
  - [ ] 座標系変換（WEBGL）
  - [ ] 半透明描画（tint）

- [ ] **H-3. TestModeシーンフロー**
  - [ ] IdleScene → TestIdleSceneリネーム
  - [ ] PlayingScene既存維持確認
  - [ ] System Control動作確認

- [ ] **H-4. ChallengeModeシーンフロー**
  - [ ] ChallengeIdleScene作成
  - [ ] ChallengePlayingScene作成
  - [ ] MessageScene統合
  - [ ] CountdownScene統合
  - [ ] ResultScene統合

- [ ] **H-5. HTML/CSS更新**
  - [ ] testModeButton追加
  - [ ] challengeModeButton追加
  - [ ] mode-buttonスタイリング
  - [ ] レスポンシブ確認

- [ ] **H-6. SceneManager更新**
  - [ ] SceneType拡張
  - [ ] GameMode型追加
  - [ ] setMode/getMode実装
  - [ ] シーン登録（modeSelect/testIdle/challengeIdle/challengePlaying）

- [ ] **H-7. main.ts統合**
  - [ ] ModeSelectScene初期化
  - [ ] ChallengeIdleScene初期化
  - [ ] ChallengePlayingScene初期化
  - [ ] TestIdleScene初期化
  - [ ] 初期シーン: modeSelect

- [ ] **H-8. 統合テスト**
  - [ ] Mode選択画面表示
  - [ ] Test Mode動作確認
  - [ ] Challenge Mode動作確認
  - [ ] ChallengeModeView描画確認
  - [ ] Voice continuity検出確認
  - [ ] Result → Back → ModeSelect確認

---

## 🔮 Future Enhancements

### v1.6候補

- **Challenge Mode難易度調整:**
  - Easy/Normal/Hard選択
  - silentFrames閾値変更（Easy: 60, Normal: 30, Hard: 15）

- **Test Mode拡張:**
  - 録音機能
  - リプレイ機能
  - データエクスポート

- **両モード共通:**
  - ランキングシステム（localStorage）
  - シェア機能（Twitter連携）

---

## 📝 Notes

### Design Decisions

1. **Test Modeは既存機能を維持**
   - ViewManager完全使用
   - System Control完全版
   - タイマー・Easy Mode対応

2. **Challenge Modeは新規Experience**
   - ChallengeModeView固定
   - Voice continuity検出
   - 連続発声チャレンジ

3. **System Controlは両モード共通**
   - 右側パネル維持
   - Easy Modeトグル（Test Modeのみ有効）
   - Clear Lineスライダー（両モード有効）

### Coordinate System (WEBGL)

```
p5.js WEBGL座標系（中央原点）

         Y- (上)
          |
          |
X- ───────┼────────── X+ (右)
  (左)    |
          |
         Y+ (下)

Canvas: 800x600
Origin: (0, 0) = Center
Top-Left: (-400, -300)
Bottom-Right: (400, 300)
```

---

**End of MODE_SYSTEM.md**

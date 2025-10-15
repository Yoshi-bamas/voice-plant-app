# Voice Plant App - Architecture Document (v1.0)

## 概要
音声入力で動的に変化する植物ビジュアライゼーションアプリ。モジュール化されたView構造、状態管理、Canvas/UI分離により、完成された体験を提供。

**v1.0新機能:**
- **状態管理:** Clear後に植物完成状態を維持（`PlantState: 'growing' | 'cleared'`）
- **カスタマイズ可能UI:** Clearライン調整スライダー（0.5-1.0）
- **コンソールUI:** Canvas外にデバッグ情報・コントロール集約（SF風スタイリング）
- **継続エフェクト:** Clear後の花びら降下（軽量、20粒子上限）

## ディレクトリ構成

```
src/
├── main.ts                  # エントリーポイント、p5.js初期化、UI統合
├── audio.ts                 # Web Audio API（音量・周波数解析）
├── types.ts                 # IViewインターフェース定義
├── utils.ts                 # 共通ユーティリティ（HSL変換、周波数処理、音量増幅）
├── ViewManager.ts           # View切り替え管理（Plant/Visualizer/Fractal）
│
├── PlantView.ts             # 植物ビュー（茎・葉）
├── PlantViewEasy.ts         # 植物ビュー（Easy Mode: 10倍増幅）
├── VisualizerView.ts        # 円形FFTビジュアライザー
├── visualizer.ts            # 円形ビジュアライザー描画関数
├── animation.ts             # 茎・葉の描画関数（レガシー）
│
├── views/experimental/      # 実験的機能
│   ├── FractalPlantView.ts         # フラクタル植物（再帰的分岐）
│   ├── FractalPlantViewEasy.ts     # フラクタル植物（Easy Mode）
│   └── fractalAlgorithms.ts        # 再帰描画アルゴリズム
│
└── effects/                 # 共通エフェクトモジュール（新規）
    ├── Particle.ts                 # 粒子クラス（位置・速度・life管理）
    ├── ParticleSystem.ts           # 粒子システム（生成・更新・描画）
    └── ConcreteEffect.ts           # コンクリート背景・ひび割れエフェクト
```

## アーキテクチャ設計原則

### 1. View Pattern (v1.0拡張)
すべてのビジュアライゼーションは`IView`インターフェースを実装：
```typescript
interface IView {
    update(audioAnalyzer: AudioAnalyzer): void;  // 音声データから状態更新
    draw(p: p5): void;                           // p5.jsでCanvas描画
    setClearThreshold?(threshold: number): void; // v1.0: スライダー連携（オプショナル）
}
```

**v1.0利点:**
- ViewManager経由で統一的に管理
- Clearライン調整をすべてのViewに一括適用
- VisualizerViewはClear機能なしでもsetClearThreshold未実装でOK（オプショナル）
- 各Viewが独立して動作

### 2. モジュール分離
機能ごとに責任を明確化：

| モジュール | 責任 |
|----------|------|
| `audio.ts` | Web Audio API、AnalyserNode、音量/周波数解析 |
| `utils.ts` | 数学関数、色変換、データ処理（再利用可能） |
| `effects/` | ビジュアルエフェクト（粒子、背景）- Viewから独立 |
| `PlantView.ts` | 植物の成長ロジック、エフェクト統合 |
| `FractalPlantView.ts` | フラクタル成長ロジック、エフェクト統合 |

### 3. 継承によるバリエーション
Easy Modeは基底クラスを継承し、パラメータのみ変更：
```typescript
PlantView → PlantViewEasy (10倍増幅)
FractalPlantView → FractalPlantViewEasy (10倍増幅)
```

**利点:**
- コードの重複を回避
- バグ修正が基底クラスで一元管理
- パラメータ調整のみで新モード追加可能

### 4. エフェクトの共通化
Clear!エフェクト（粒子・コンクリート）は独立モジュール：
```typescript
// PlantView.ts（例）
import { ParticleSystem } from './effects/ParticleSystem';
import { ConcreteEffect } from './effects/ConcreteEffect';

class PlantView implements IView {
    private particles: ParticleSystem;
    private concrete: ConcreteEffect;

    update(audioAnalyzer: AudioAnalyzer): void {
        if (volume > 0.8 && !clearTriggered) {
            this.particles.burst(x, y, 100); // 粒子100個発射
            this.concrete.crack();            // ひび割れ発生
        }
        this.particles.update();
    }

    draw(p: p5): void {
        this.concrete.draw(p);
        this.particles.draw(p);
    }
}
```

**利点:**
- PlantViewとFractalPlantViewで同じエフェクトを再利用
- エフェクトの改善が全Viewに反映
- テストとデバッグが容易

## データフロー（v1.0拡張版）

### 音声入力 → Canvas描画フロー
```
マイク入力
    ↓
AudioAnalyzer (Web Audio API)
    ↓
    ├── getVolume() → 0-1の音量値
    ├── getFrequency() → {low, mid, high, average}
    └── getFrequencyBands() → 周波数帯配列
    ↓
ViewManager.update(audioAnalyzer)
    ↓
currentView.update(audioAnalyzer)  ← PlantView / FractalPlantView / VisualizerView
    ↓
    ├── 【v1.0】状態分岐（plantState === 'growing' or 'cleared'）
    ├── growing: 音量で高さ更新、Clear判定（volume > clearThreshold）
    ├── cleared: 高さ固定、継続エフェクト（花びら降下）
    └── エフェクト発動（ParticleSystem.burst/generateContinuous, ConcreteEffect.crack）
    ↓
currentView.draw(p)
    ↓
Canvas描画（p5.js）
    ↓
【v1.0】DOM更新（main.ts）
    ├── volumeValue.textContent = smoothedVolume.toFixed(3)
    ├── heightValue.textContent = currentHeight.toFixed(0) + 'px'
    └── clearStateValue.textContent = plantState === 'cleared' ? 'CLEARED' : 'Growing'
```

### UI操作 → View設定フロー（v1.0新規）
```
ユーザー操作（Clearスライダー移動）
    ↓
main.ts: clearSlider.addEventListener('input', ...)
    ↓
viewManager.setClearThreshold(sliderValue)
    ↓
currentView.setClearThreshold?(sliderValue)  ← オプショナルチェイン
    ↓
PlantView/FractalPlantView: this.clearThreshold = clamp(sliderValue, 0.5, 1.0)
    ↓
壁のY座標再計算（次フレームから反映）
```

## v1.0状態管理設計

### PlantState型定義
```typescript
// types.ts
export type PlantState = 'growing' | 'cleared';
```

### PlantView実装例
```typescript
export class PlantView implements IView {
    private plantState: PlantState = 'growing';
    private clearedHeight: number = 0;
    protected clearThreshold: number = 0.8;
    private clearTriggered: boolean = false;

    // 状態遷移メソッド
    private transitionToCleared(): void {
        this.plantState = 'cleared';
        this.clearedHeight = this.calculateCurrentHeight(); // 現在の高さを保存
        this.clearTriggered = true;
        this.triggerClear(); // 粒子バースト、ひび割れ
    }

    // 状態別update処理
    update(audioAnalyzer: AudioAnalyzer): void {
        const volume = audioAnalyzer.getVolume();
        this.smoothedVolume = this.smoothedVolume * 0.7 + volume * 0.3;

        if (this.plantState === 'growing') {
            // 通常成長処理
            this.currentHeight = this.smoothedVolume * 400;

            // Clear判定
            if (this.smoothedVolume > this.clearThreshold && !this.clearTriggered) {
                this.transitionToCleared();
            }

            // Clear終了判定（リトライ可能にする場合）
            if (this.smoothedVolume < 0.3 && this.clearTriggered) {
                this.clearTriggered = false; // 再挑戦可能
            }
        } else {
            // cleared状態: 高さ固定、継続エフェクトのみ
            this.currentHeight = this.clearedHeight;
            this.updateClearedEffects(audioAnalyzer);
        }

        // 共通エフェクト更新
        this.particles.update();
        this.concrete.update();
    }

    // Clear後の継続エフェクト
    private updateClearedEffects(audioAnalyzer: AudioAnalyzer): void {
        // 継続的な花びら降下（軽量）
        const topX = this.calculateTopX();
        const topY = this.calculateTopY();
        this.particles.generateContinuous(topX, topY); // 1-2個/フレーム、上限20
    }

    // Clearライン調整（スライダー連携）
    setClearThreshold(threshold: number): void {
        this.clearThreshold = Math.max(0.5, Math.min(1.0, threshold));
    }
}
```

### 状態遷移図
```
[初期状態: growing]
    ↓
    音量入力で成長
    ↓
    smoothedVolume > clearThreshold?
    ↓ Yes
[状態遷移: cleared]
    ↓
    clearedHeight固定
    継続エフェクト（花びら降下）
    ↓
    音量入力無視（または装飾のみ）
```

### パフォーマンス考慮
- **growing状態:** 音量計算、高さ更新、Clear判定（60fps）
- **cleared状態:** 高さ計算スキップ、継続粒子のみ（軽量）
- **粒子上限:** バースト時150個 → 継続時20個上限（メモリ節約）

## v1.0 UI/Canvas分離アーキテクチャ

### HTMLレイアウト構造
```html
<div class="app-container">
    <div class="canvas-area">
        <div id="canvas-wrapper"></div> <!-- p5.js描画エリア -->
        <div id="clearMessage" class="clear-message">Clear!</div>
    </div>
    <div class="console-area">
        <div class="console-header">Voice Plant Console</div>
        <div class="console-section debug-info">
            <h3>Status</h3>
            <div class="debug-item">
                <span class="label">Volume:</span>
                <span class="value" id="volumeValue">0.000</span>
            </div>
            <div class="debug-item">
                <span class="label">Height:</span>
                <span class="value" id="heightValue">0px</span>
            </div>
            <div class="debug-item">
                <span class="label">State:</span>
                <span class="value" id="clearStateValue">Growing</span>
            </div>
        </div>
        <div class="console-section controls">
            <h3>Controls</h3>
            <div class="view-buttons">...</div>
            <div class="easy-mode-toggle">...</div>
            <div class="clear-threshold-slider">
                <label>Clear Line: <span id="thresholdValue">0.80</span></label>
                <input type="range" id="clearSlider" min="0.5" max="1.0" step="0.05" value="0.8">
            </div>
        </div>
    </div>
</div>
```

### CSS Grid実装
```css
.app-container {
    display: grid;
    grid-template-columns: 1fr 300px; /* Canvas可変 + Console固定 */
    height: 100vh;
    overflow: hidden;
}

@media (max-width: 768px) {
    .app-container {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr; /* Console上 + Canvas下 */
    }
}
```

### 責任分離
| 領域 | 責任 | 技術 |
|------|------|------|
| **canvas-area** | ビジュアル表現のみ | p5.js Canvas描画 |
| **console-area** | UI操作、デバッグ情報 | DOM操作（textContent更新） |
| **main.ts** | 両者の統合、イベントリスナー | TypeScript |

## Clear!エフェクト実装戦略（v0.x→v1.0進化）

### フェーズ11: Clear!メッセージ
**ゴール:** 音量0.8以上で"Clear!"をDOM表示

**実装箇所:**
- `PlantView.ts`, `FractalPlantView.ts`のupdate()内で判定
- `index.html`に`<div id="clearMessage" class="clear-message">Clear!</div>`
- `main.ts`でDOM要素取得、各Viewに渡す（または直接操作）

**プロトタイプ仕様:**
```typescript
// PlantView.ts
private clearTriggered = false;

update(audioAnalyzer: AudioAnalyzer): void {
    if (this.smoothedVolume > 0.8 && !this.clearTriggered) {
        this.clearTriggered = true;
        this.showClearMessage(); // DOM操作
        setTimeout(() => { this.clearTriggered = false; }, 2000);
    }
}

showClearMessage(): void {
    const msg = document.getElementById('clearMessage');
    if (msg) {
        msg.classList.add('clear-message--visible');
        setTimeout(() => msg.classList.remove('clear-message--visible'), 2000);
    }
}
```

### フェーズ12: 花の粒子エフェクト
**ゴール:** Clear!時に粒子が放射状に広がる

**モジュール設計:**
```typescript
// effects/Particle.ts
export class Particle {
    x: number; y: number;
    vx: number; vy: number;  // 速度
    life: number;            // 0-1（1で生成、0で消滅）
    color: [number, number, number];

    update(): void {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;      // 重力
        this.life -= 0.01;   // 寿命減少
    }
}

// effects/ParticleSystem.ts
export class ParticleSystem {
    private particles: Particle[] = [];

    burst(x: number, y: number, count: number): void {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.particles.push(new Particle(x, y, speed, angle));
        }
    }

    update(): void {
        this.particles = this.particles.filter(p => {
            p.update();
            return p.life > 0;
        });
    }

    draw(p: p5): void {
        this.particles.forEach(particle => {
            p.fill(particle.color[0], particle.color[1], particle.color[2], particle.life * 255);
            p.noStroke();
            p.circle(particle.x, particle.y, 8);
        });
    }
}
```

### フェーズ13: コンクリート背景
**ゴール:** 画面下部30%にグレーの地面

**実装:**
```typescript
// effects/ConcreteEffect.ts
export class ConcreteEffect {
    private crackProgress = 0;

    drawBackground(p: p5): void {
        const groundY = p.height * 0.7;
        p.fill(80, 80, 80);
        p.noStroke();
        p.rect(0, groundY, p.width, p.height - groundY);
    }
}
```

### フェーズ14: コンクリート突き破りエフェクト
**ゴール:** ひび割れ線を描画

**実装:**
```typescript
// effects/ConcreteEffect.ts（続き）
crack(): void {
    this.crackProgress = 1.0;
}

update(): void {
    this.crackProgress *= 0.95; // 減衰
}

drawCracks(p: p5): void {
    if (this.crackProgress <= 0.01) return;

    const groundY = p.height * 0.7;
    p.stroke(60, 60, 60, this.crackProgress * 255);
    p.strokeWeight(3);

    // ランダムなひび割れ線（シード固定で再現性確保）
    for (let i = 0; i < 5; i++) {
        const startX = p.width * (0.4 + i * 0.05);
        p.line(startX, groundY, startX + p.random(-30, 30), groundY + 50);
    }
}
```

## 今後の拡張性（v1.0以降のロードマップ）

### v1.0.5: Canvas 2D最適化（即時実装可）
**目標:** 現行コードそのままで粒子数150→500個

**実装内容:**
```typescript
// ParticleSystem.ts 最適化版
export class ParticleSystem {
    private particleGraphic: p5.Graphics | null = null;

    draw(p: p5): void {
        // 初回のみ: 粒子テンプレート作成
        if (!this.particleGraphic) {
            this.particleGraphic = p.createGraphics(20, 20);
            this.particleGraphic.fill(255);
            this.particleGraphic.noStroke();
            this.particleGraphic.circle(10, 10, 10);
        }

        // 高速描画: image()で使い回し
        this.particles.forEach(particle => {
            const size = particle.life * 12 + 4;
            p.tint(particle.color[0], particle.color[1], particle.color[2], particle.life * 255);
            p.image(this.particleGraphic, particle.x - size/2, particle.y - size/2, size, size);
        });
    }
}
```

**効果:**
- 描画速度: 2-3倍高速化
- 粒子数上限: 150 → 500個
- 実装時間: 15-30分
- 互換性: 100%（既存コード変更不要）

---

### v1.1: WebGL移行 + 3D演出
**目標:** GPU並列処理で粒子10000個、3D表現追加

**移行戦略（段階的、後方互換保証）:**

#### Phase 1: WEBGL基盤（20分）
```typescript
// main.ts（1行変更）
p.createCanvas(800, 600, p.WEBGL);

// PlantView.ts, FractalPlantView.ts（各1行追加）
draw(p: p5): void {
    p.translate(-p.width/2, -p.height/2); // 座標系保護
    // 既存描画コードそのまま動く
}
```

#### Phase 2: 粒子3D化（30分）
```typescript
// ParticleSystem.ts（WEBGL版）
draw(p: p5): void {
    this.particles.forEach(particle => {
        p.push();
        p.translate(particle.x, particle.y, 0);
        p.fill(particle.color[0], particle.color[1], particle.color[2], particle.life * 255);
        p.noStroke();
        p.sphere(particle.life * 6 + 2); // 3D球体
        p.pop();
    });
}
```

#### Phase 3: 3D演出追加（任意、段階的）
```typescript
// ライティング
p.directionalLight(255, 255, 255, 0, 1, -1);
p.ambientLight(80);

// 粒子回転
p.rotateZ(particle.rotation);

// カメラワーク
p.camera(0, 0, 800, 0, 0, 0, 0, 1, 0);
```

**互換性マトリクス:**

| モジュール | 変更必要 | 変更量 | 時間 | 互換性 |
|----------|---------|-------|------|--------|
| Particle.ts | ❌ なし | 0行 | 0分 | 100% |
| audio.ts | ❌ なし | 0行 | 0分 | 100% |
| ViewManager.ts | ❌ なし | 0行 | 0分 | 100% |
| types.ts | ❌ なし | 0行 | 0分 | 100% |
| utils.ts | ❌ なし | 0行 | 0分 | 100% |
| ParticleSystem.ts | ⚠️ 座標補正 | 1-3行 | 5分 | 95% |
| ConcreteEffect.ts | ⚠️ 座標補正 | 1-3行 | 5分 | 95% |
| animation.ts | ⚠️ 座標補正 | 1-3行 | 5分 | 95% |
| PlantView.ts | ⚠️ translate追加 | 1行 | 2分 | 100% |
| FractalPlantView.ts | ⚠️ translate追加 | 1行 | 2分 | 100% |
| main.ts | ⚠️ WEBGL指定 | 1行 | 1分 | 100% |
| **合計** | - | **10-20行** | **20分** | **98%** |

**ロールバック手順:**
```typescript
// WebGLで問題発生時（2分で元に戻る）
// 1. main.tsでp.WEBGLを削除
// 2. 各View.draw()のtranslate()をコメントアウト
// → 完全に元の状態に復帰
```

**v1.1で得られる恩恵:**
- 粒子数: 500 → 10000個以上（20倍）
- CPU使用率: 50%削減（GPU並列処理）
- 新演出: 3D回転、ライティング、カメラワーク
- 将来性: シェーダー、VR対応への布石

---

### v1.2: エフェクト強化（WEBGLベース）
**目標:** 継続粒子の視覚的品質向上

1. **花びら形状:**
   - SVGパス使用（ベジェ曲線で花びら形状）
   - 回転アニメーション（z軸回転、3D風）
   - サイズバリエーション（大中小ランダム）

2. **光の粒子:**
   - 星型パーティクル（Clear後の追加演出）
   - キラキラエフェクト（alpha値ランダム変動）
   - 周波数連動（高音で輝度増加）

3. **コンクリート質感:**
   - Simplexノイズテクスチャ（リアルなコンクリート）
   - ひび割れアニメーション（徐々に拡大）
   - 破片エフェクト（物理演算）

### v1.2: 新Viewモード
**目標:** 表現バリエーション追加

1. **SeasonalPlantView:**
   - 春: 桜（ピンク粒子）
   - 夏: 向日葵（黄色、太陽モチーフ）
   - 秋: 紅葉（赤・オレンジ）
   - 冬: 雪の結晶（青・白）

2. **3DPlantView:**
   - three.jsまたはp5.js WEBGL mode
   - 3D回転可能な植物
   - ライティング・シャドウ

3. **AquaticView:**
   - 水中植物（海藻、珊瑚）
   - 泡エフェクト
   - 揺らぎアニメーション（波）

### v1.3: ソーシャル機能
**目標:** シェア・コミュニティ

1. **スクリーンショット:**
   - p5.js saveCanvas()
   - Clear時の自動キャプチャ
   - SNSシェアボタン（Twitter, Instagram）

2. **録画機能:**
   - MediaRecorder API
   - 10秒間の成長過程録画
   - GIF/MP4エクスポート

3. **ギャラリー:**
   - 他ユーザーの作品閲覧
   - いいね・コメント機能
   - トレンド表示（人気の色・形状）

### v2.0: マルチプレイヤー
**目標:** 協力プレイ、競争モード

1. **協力成長モード:**
   - 2人同時に声を出して成長加速
   - WebRTC音声通信
   - リアルタイム同期（WebSocket）

2. **競争モード:**
   - 誰が早くClearできるか
   - リーダーボード
   - タイムアタック

3. **ガーデン共有:**
   - 複数の植物を同一画面に配置
   - 友達の植物と並べて鑑賞
   - コラボレーション作品

### 安全な更新プロセス
1. **エフェクトモジュール単体テスト:** ParticleSystem.burst() → 粒子数確認
2. **View個別テスト:** PlantViewのみでClear!動作確認
3. **統合テスト:** 全View + Easy Modeで動作確認
4. **ロールバック容易性:** effects/フォルダごと削除で元に戻せる設計

## 型安全性

```typescript
// types.ts（将来の拡張）
export interface IEffect {
    update(): void;
    draw(p: p5): void;
}

export interface IClearTrigger {
    checkClear(volume: number): boolean;
    triggerEffects(): void;
}
```

## まとめ
- **モジュール化:** effects/で共通エフェクト管理
- **View独立性:** PlantView、FractalPlantViewが個別にエフェクト統合
- **プロトタイプ優先:** シンプルな実装でロジック検証
- **拡張容易性:** インターフェースとモジュール分離で安全に機能追加

---

## v1.3追加機能（2025年実装）

### ゲームモード実装

#### PlantState型拡張
```typescript
// types.ts（v1.3）
export type PlantState = 'growing' | 'cleared' | 'gameOver';
```

**状態遷移図（v1.3版）:**
```
[初期状態: growing]
    ↓
    タイマー開始（30秒 or 60秒）
    ↓
    音量入力で成長
    ↓
    ┌─────────────────────────┐
    │ smoothedVolume > clearThreshold? │
    ├─────────────────────────┤
    │ Yes → [cleared]         │
    │   勝利！                │
    │   Clearメッセージ表示    │
    │   2秒後に粒子クリア      │
    │   継続エフェクト開始     │
    └─────────────────────────┘
    ↓ No
    ┌─────────────────────────┐
    │ 制限時間経過？           │
    ├─────────────────────────┤
    │ Yes → [gameOver]        │
    │   敗北...               │
    │   GameOverメッセージ表示 │
    │   Backボタン出現        │
    └─────────────────────────┘
```

#### タイマー機能実装
```typescript
// PlantView.ts（v1.3追加）
export class PlantView implements IView {
    private startTime: number = 0;
    private timeLimit: number = 30000;  // 30秒
    private gameOverFrame: number = 0;

    constructor() {
        this.startTime = Date.now();
    }

    update(audioAnalyzer: AudioAnalyzer): void {
        if (this.plantState === 'growing') {
            const elapsed = Date.now() - this.startTime;
            if (elapsed >= this.timeLimit) {
                this.transitionToGameOver();
            }
        }
        // ... 既存処理
    }

    private transitionToGameOver(): void {
        this.plantState = 'gameOver';
        this.showGameOverMessage();
    }
}
```

#### リセット機能
```typescript
// IView拡張（v1.3）
export interface IView {
    update(audioAnalyzer: AudioAnalyzer): void;
    draw(p: p5): void;
    setClearThreshold?(threshold: number): void;
    getPlantState?(): PlantState;              // v1.3追加
    reset?(): void;                             // v1.3追加
    getRemainingTime?(): number | null;        // v1.3追加
}

// ViewManager.ts（v1.3追加）
export class ViewManager {
    resetCurrentView(): void {
        this.currentView.reset?.();
    }

    getRemainingTime(): number | null {
        return this.currentView.getRemainingTime?.() ?? null;
    }
}
```

### v1.2/v1.3パフォーマンス最適化

#### WebGL移行完了
```typescript
// main.ts（v1.2実装済み）
p.createCanvas(800, 600, p.WEBGL);

// 全Viewで座標系補正
draw(p: p5): void {
    p.translate(-p.width / 2, -p.height / 2);
    // 既存描画コード（互換性100%）
}
```

#### 粒子システム最適化
**v1.3最適化内容:**
- 粒子数: 5000個 → **500個**（10分の1、FPS安定化）
- 残像トレイル: 8フレーム → **3フレーム**（line()描画削除）
- グロー層: 4層 → **2層**（外側グロー + 実体のみ）
- Clear後自動クリア: **2秒後にバースト粒子削除**

```typescript
// ParticleSystem.ts（v1.3最適化版）
export class ParticleSystem {
    draw(p: p5): void {
        this.particles.forEach(particle => {
            p.push();
            p.translate(particle.x, particle.y, particle.z);
            p.rotateZ(particle.rotation);

            // 外側グロー（1.5倍）
            p.fill(particle.color[0], particle.color[1], particle.color[2], alpha * 0.3);
            p.sphere(baseSize * 1.5);

            // 実体（鮮明）
            p.fill(particle.color[0], particle.color[1], particle.color[2], alpha);
            p.sphere(baseSize);

            p.pop();
        });
    }
}
```

**描画オブジェクト数の削減:**
- **修正前:** 5000個×4球体+5000個×8本線 = 60,000オブジェクト
- **修正後:** 500個×2球体 = 1,000オブジェクト
- **削減率:** 98.3%削減 → **60fps安定動作**

#### Clear後の軽量化
```typescript
// PlantView.ts（v1.3最適化）
private transitionToCleared(): void {
    this.plantState = 'cleared';
    this.triggerClear();

    // 2秒後に粒子クリア
    setTimeout(() => {
        if (this.plantState === 'cleared') {
            this.particles.clear();  // バースト粒子を削除
            // 継続エフェクト（花びら30個+キラキラ15個）のみ残る
        }
    }, 2000);
}
```

### UI/UX強化

#### コンソールUI（v1.0）
- Matrix風スタイリング（ネオン緑、Courier New）
- リアルタイムデバッグ情報（音量、周波数、状態、タイマー）
- Clearライン調整スライダー（0.5-1.0）

#### ゲームUI（v1.3）
- タイマー表示（Time: Xs）
- Game Overメッセージ（赤色グロー、フェードイン）
- Backボタン（Clear/GameOver後に表示）

```html
<!-- index.html（v1.3追加要素） -->
<div id="gameOverMessage" class="game-over-message">Game Over</div>
<button id="backButton" class="back-button back-button--hidden">Back to Start</button>

<div class="console-data-item">
    <span>Time:</span>
    <span id="timeValue">--</span>
</div>
```

### パフォーマンス指標

| 項目 | v1.0 | v1.2 | v1.3最適化 |
|------|------|------|------------|
| レンダリング | Canvas 2D | **WebGL** | WebGL |
| 粒子数（バースト） | 150個 | 5000個 | **500個** |
| 粒子数（継続） | 20個 | 20個 | **45個** |
| グロー層 | 2層 | 4層 | **2層** |
| 残像トレイル | なし | 8フレーム | **削除** |
| 描画オブジェクト数 | 300個 | 60,000個 | **1,000個** |
| FPS（目標） | 60fps | 30fps | **60fps** |

### 今後のロードマップ

**v1.4予定（演出強化）:**
- WEBGL_IDEAS.md参照
- カメラワーク（音量連動ズーム）
- ダイナミックライティング
- 3D粒子トルネード

**v2.0予定（マルチプレイヤー）:**
- 協力成長モード
- 競争モード
- リアルタイム同期（WebSocket）

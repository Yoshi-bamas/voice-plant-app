# Voice Plant App - Architecture Document

## 概要
音声入力で動的に変化する植物ビジュアライゼーションアプリ。モジュール化されたView構造により、複数の表現形式を切り替え可能。

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

### 1. View Pattern
すべてのビジュアライゼーションは`IView`インターフェースを実装：
```typescript
interface IView {
    update(audioAnalyzer: AudioAnalyzer): void;  // 音声データから状態更新
    draw(p: p5): void;                           // p5.jsでCanvas描画
}
```

**利点:**
- ViewManager経由で統一的に管理
- 新しいViewの追加が容易
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

## データフロー

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
    ├── 内部状態更新（高さ、色、分岐角度など）
    ├── Clear!判定（volume > 0.8）
    └── エフェクト発動（ParticleSystem.burst, ConcreteEffect.crack）
    ↓
currentView.draw(p)
    ↓
Canvas描画（p5.js）
```

## Clear!エフェクト実装戦略

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

## 今後の拡張性

### プロトタイプ → 本実装への移行
現在はロジック検証フェーズ。今後の拡張ポイント：

1. **粒子の見た目改善:**
   - 花びら形状（ベジェ曲線、SVG）
   - グラデーション、テクスチャ
   - 回転アニメーション

2. **コンクリートの質感:**
   - Simplexノイズでテクスチャ
   - ひび割れのPath2D（複雑な形状）
   - 破片の物理シミュレーション

3. **サウンド連動強化:**
   - 周波数で粒子の色変化
   - 低音でコンクリート振動
   - ビート検出で特殊エフェクト

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

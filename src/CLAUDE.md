# Src Folder - Claude Instructions (v1.0)

## Overview
**v1.0追加:** 状態管理（PlantState）、UI/Canvas分離、clearThreshold可変化

- **main.ts:** p5.jsスケッチ初期化、DOM UIイベント（スライダー・ボタン）、ViewManager統合。型: p5, MediaStream。
- **audio.ts:** 音量（RMS）、周波数（バンド平均）。型: VolumeData, FrequencyBand。
- **animation.ts:** Simplexノイズ茎揺らぎ、ベジェ曲線葉。型: なし（関数エクスポート）。
- **types.ts (v1.0拡張):**
  ```typescript
  export type PlantState = 'growing' | 'cleared';
  export interface IView {
      update(audioAnalyzer: AudioAnalyzer): void;
      draw(p: p5): void;
      setClearThreshold?(threshold: number): void; // v1.0追加
  }
  ```
- **utils.ts:** SimplexNoise、HSL変換、音量増幅、周波数対数スケール。
- **ViewManager.ts (v1.0拡張):** View切替、clearThreshold一括設定。
- **effects/:** Particle（位置・速度・life）、ParticleSystem（burst/継続生成）、ConcreteEffect（壁・ひび割れ）。

## Guidelines (v1.0強化版)
- **TypeScript**: Strictモード必須。PlantState型、IView拡張（setClearThreshold）。any禁止。
- **状態管理ベストプラクティス（v1.0核心）:**
  ```typescript
  // PlantView.ts
  export class PlantView implements IView {
      private plantState: PlantState = 'growing';
      private clearedHeight: number = 0;
      protected clearThreshold: number = 0.8; // デフォルト

      update(audioAnalyzer: AudioAnalyzer): void {
          if (this.plantState === 'growing') {
              // 通常成長処理
              if (this.smoothedVolume > this.clearThreshold && !this.clearTriggered) {
                  this.transitionToCleared();
              }
          } else {
              // cleared状態: 高さ固定、装飾エフェクトのみ
              this.updateClearedEffects(audioAnalyzer);
          }
      }

      setClearThreshold(threshold: number): void {
          this.clearThreshold = Math.max(0.5, Math.min(1.0, threshold));
      }

      private transitionToCleared(): void {
          this.plantState = 'cleared';
          this.clearedHeight = this.calculateCurrentHeight();
          this.triggerClear();
      }
  }
  ```
- **DOM操作ルール:**
  - Canvas描画（p5.js）とUI要素（HTML/CSS）を完全分離。
  - デバッグ情報はDOM要素（`<span id="volumeValue">`）に書き込み、Canvas描画から除去。
  - main.tsでDOMイベントリスナー設定、ViewManagerに伝播。
- **パフォーマンス最適化:**
  - Clear後の継続粒子: 上限20個、1フレーム1-2個生成（60fps維持）。
  - Simplexノイズ: グローバルインスタンス再利用（メモリ節約）。
  - 不要な再計算を避ける（cleared状態では音量計算スキップ可）。
- **Test**: 型チェック（tsc --noEmit）、状態遷移テスト（growing→cleared）、clearThreshold境界値。
- **Debug**: コンソールUIにデバッグ情報移動。Canvas描画は視覚表現のみ。
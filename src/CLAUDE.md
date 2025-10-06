# Src Folder - Claude Instructions

## Overview
- main.ts: p5.jsスケッチ初期化、マイク許可、イベントリスナー。型: p5, MediaStream。
- audio.ts: 音量（RMS from getFloatTimeDomainData）、周波数（getByteFrequencyDataバンド平均）。型: VolumeData, FrequencyBand。
- animation.ts: 動的植物（p5.js bezier, Path2D）、葉SVG配置、粒子エフェクト。型: PlantParams。
- types.ts: インターフェース（PlantParams { height, branchAngle, leafCount }, VolumeData, FrequencyBand）。
- utils.ts: SimplexNoise、HSL変換、easeInOutQuad。

## Guidelines
- **TypeScript**: 型定義必須（e.g., PlantParams { height: number, branchAngle: number }）。p5.js型（@types/p5）。
- **アニメーション調整**:
  - 茎: p5.bezierで成長（音量→height）。Simplexノイズで揺れ（振幅±10px）。
  - 葉: SVGをp5.imageで配置、周波数で角度/数制御。
  - Clear!: 音量>0.8で粒子（p5.circle）、コンクリートPath2D破片。
- **インフラ固め**:
  - audio.ts: AnalyserNode切断（メモリリーク防止）。
  - main.ts: p5.setupでCanvas初期化、エラー処理。
- **Test**: 型チェック（tsc --noEmit）、mock音量/周波数テスト。
- **Debug**: 音量/周波数リアルタイム表示、Canvas上にパラメータオーバーレイ。
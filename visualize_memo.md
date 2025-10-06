# Voice Plant App - ビジュアライゼーション技術メモ

## プロジェクト概要
音声入力を可視化する2Dウェブアプリ
- **技術スタック**: TypeScript, p5.js (Canvas 2D), Web Audio API
- **目標**: 音量・周波数をリアルタイムで視覚的に表現

---

## 1. 実装済みの技術

### 1-1. 色のパラメトリック変化 ✅
- **実装箇所**: `animation.ts:51-54`, `visualizer.ts:27-29`
- **技術**: HSL→RGB変換（`utils.ts:hslToRgb`）
- **効果**:
  - 植物モード: 周波数（0-1）→ Hue（120°緑→0°赤）
  - ビジュアライザー: バンドインデックス → Hue（240°青→0°赤）
- **改善可能性**: 彩度・明度も音量連動で変化させる

### 1-2. 線幅・太さの動的変化 ✅
- **実装箇所**: `animation.ts:59` (茎の太さ8px固定)
- **改善可能性**: 音量に応じて太さを変動（4-12px）

### 1-3. ベジェ曲線による有機的形状 ✅
- **実装箇所**: `animation.ts:15-40` (drawLeaf関数)
- **技術**: p5.js bezierVertex
- **効果**: 滑らかな葉の形状
- **拡張可能性**: Catmull-Romスプラインで複数葉を接続

### 1-4. パラメータの時間・音声依存アニメーション ✅
- **実装箇所**:
  - `PlantView.ts:19`: 音量スムージング（smoothingFactor: 0.3）
  - `utils.ts:61-95`: 周波数帯域の対数スケール・閾値処理
- **技術**:
  - 非線形マッピング: `Math.pow(average, 1.5)`
  - 対数スケール: `Math.pow(i / segments, 1.8)`
- **効果**: 滑らかな変化、小さい音を抑制

### 1-5. 円形配置（放射状レイアウト） ✅
- **実装箇所**: `visualizer.ts:12-43`
- **技術**: 三角関数で極座標→直交座標変換
- **効果**: 16本のバーを円形に配置

---

## 2. 実装予定の技術（toDo.mdより）

### 2-1. 粒子システム（フェーズ12）
- **用途**: Clear!エフェクト（花が咲く演出）
- **技術**:
  - 粒子配列管理（位置、速度、寿命）
  - 重力・減衰処理
  - p5.js `circle()` で描画
- **実装方法**:
  ```typescript
  interface Particle {
    x: number; y: number;
    vx: number; vy: number; // 速度
    life: number; // 0-1
  }
  ```

### 2-2. パス変形エフェクト（フェーズ14）
- **用途**: SimplexNoiseで茎の揺らぎ
- **技術**: `simplex-noise`ライブラリ
- **効果**: ±10pxのノイズで自然な揺れ

### 2-3. 分岐アルゴリズム（フェーズ10）
- **用途**: 周波数で葉の数を制御（2-8枚）
- **技術**:
  - for loopで等間隔配置
  - 左右交互に±30度回転

---

## 3. 将来的な拡張アイデア

### 3-1. グラデーション塗りつぶし（優先度: 中）
- **用途**: 葉や茎に深みを追加
- **技術**: p5.js `lerpColor()` + Canvas線形グラデーション
- **実装例**:
  ```typescript
  const gradient = p.drawingContext.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ```

### 3-2. プロシージャルパターン（優先度: 低）
- **用途**: 葉脈や茎の模様
- **技術**: Perlin Noise（p5.js `noise()`）
- **効果**: 自然な不規則性

### 3-3. 残像エフェクト（優先度: 中）
- **用途**: ビジュアライザーの軌跡を残す
- **技術**:
  - 背景を半透明の黒で上書き: `p.background(20, 20, 20, 25)`
  - または履歴配列で過去のバンドデータを保持

### 3-4. 音声トリガー型形状変化（優先度: 高）
- **用途**: 特定周波数で特殊な葉形状
- **技術**: 周波数帯域別判定 + 条件分岐
- **実装例**:
  ```typescript
  if (frequency.high > 0.7) {
    // 尖った葉
  } else if (frequency.low > 0.7) {
    // 丸い葉
  }
  ```

---

## 4. 実験的機能（experimental/）

### 4-1. フラクタル植物ビュー ✅
- **実装箇所**: `src/views/experimental/FractalPlantView.ts`
- **アルゴリズム**: 再帰的な枝分かれ（Binary Tree Fractal）
- **技術**:
  - `fractalAlgorithms.ts:drawRecursiveBranch()` で再帰描画
  - 深度で枝の太さを調整（`depth * 0.8`）
- **音声連動**:
  - **音量** → 再帰深度（3-9）: 大きい声で枝が増殖
  - **周波数.low** → 分岐角度（20-50°）: 低音で広く開く
  - **周波数.high** → 長さ比率（0.6-0.8）: 高音で細く長く
  - **周波数.average** → 色相（120°緑→0°赤）
- **特徴**:
  - リアルタイムで成長パターンが変化
  - 音量が大きいほど複雑な樹形に進化

### 4-2. L-System（将来実装予定）
- **用途**: ルールベースの植物成長シミュレーション
- **技術**: 文字列書き換えシステム
  - 例: `F → F[+F]F[-F]F` (枝分かれルール)
- **実装方法**: `fractalAlgorithms.ts:generateLSystem()` で基礎部分を用意済み

---

## 5. 今回のプロジェクトで**使用しない**技術

以下は3D/高度な技術で、現在のスコープ外：

### ❌ 3Dシェーディング・照明
- Phong/Blinn-Phongシェーディング
- レイトレーシング/パストレーシング
- 理由: 2Dキャンバス（p5.js）を使用、WebGL未導入

### ❌ テクスチャマッピング
- UVマッピング、画像テクスチャ貼り付け
- 理由: シンプルな色変化で十分、画像不要

### ❌ GPUシェーダー（GLSL）
- WebGL/CUDAでの並列処理
- 理由: p5.js 2Dモードで十分なパフォーマンス

---

## 6. パフォーマンス最適化メモ

### 6-1. 現在の課題
- bundle.js: 1.5MB（p5.jsが大半）
- 60fps維持が目標

### 6-2. 最適化手法
- **対数スケール**: 計算量削減（O(n) → O(log n)）
- **閾値処理**: 小さい値を早期カット
- **スムージング**: 過度な再描画を防止

### 6-3. 将来的な改善
- Tree Shaking: 未使用p5.js機能を削除
- Web Worker: FFT解析をバックグラウンド化
- オフスクリーンCanvas: 複雑な描画をキャッシュ

---

## 7. 参考リンク
- p5.js リファレンス: https://p5js.org/reference/
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- simplex-noise: https://www.npmjs.com/package/simplex-noise

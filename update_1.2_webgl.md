# Update 1.2 - WebGL Migration

## 目標
Canvas 2DからWebGLに移行し、粒子数を500個→10000個に増強（20倍）

## WebGL移行の利点
- **GPU並列処理**: 粒子描画がCPUからGPUに移行
- **パフォーマンス**: 50%のCPU使用率削減
- **粒子数**: 500個 → 10000個（20倍）
- **将来性**: 3D演出、シェーダーエフェクト、ライティングが可能

## 移行戦略（段階的、リスク最小化）

### Phase 1: WEBGL基盤構築（互換性100%保証）
**目標**: Canvas 2Dコードをそのまま動かす
**実装時間**: 20分
**リスク**: 極低（ロールバック2分）

#### タスクリスト
- [ ] main.ts: `createCanvas(800, 600, p.WEBGL)`に変更（1行）
- [ ] 各View.draw(): `p.translate(-p.width/2, -p.height/2)`追加（座標系保護）
- [ ] PlantView.draw(): translate追加
- [ ] FractalPlantView.draw(): translate追加
- [ ] VisualizerView.draw(): translate追加
- [ ] ビルド＆動作確認（既存演出が正常動作すること）

**期待される結果:**
- 見た目: 完全に同じ
- パフォーマンス: ほぼ同じ（まだCanvas 2D API使用中）
- 座標系: translateで左上原点を維持

---

### Phase 2: 粒子3D化（パフォーマンス大幅向上）
**目標**: 粒子描画をWebGL APIに移行
**実装時間**: 30-45分
**リスク**: 中（粒子の見た目が変わる）

#### タスクリスト
- [ ] ParticleSystem.draw(): `image()`を`sphere()`に変更
- [ ] 粒子サイズ調整（2D円 → 3D球体）
- [ ] ライティング追加（`ambientLight()`, `pointLight()`）
- [ ] 粒子数を500 → 5000に増強（10倍テスト）
- [ ] 60fps維持確認
- [ ] 粒子数を5000 → 10000に増強（最終目標）
- [ ] 60fps維持確認

**期待される結果:**
- 粒子数: 10000個でも60fps維持
- CPU使用率: 20% → 10%（半減）
- GPU使用率: 0% → 40%
- 視覚: 3D球体で立体感向上

---

### Phase 3: 3D演出追加（オプション）
**目標**: WebGLの3D機能を活用した演出追加
**実装時間**: 1-2日
**リスク**: 低（既存機能に影響なし）

#### タスクリスト
- [ ] 粒子回転アニメーション（`rotateZ()`）
- [ ] カメラワーク（Clear時にズームイン）
- [ ] ライティング強化（動的な光源）
- [ ] カスタムシェーダー（グローエフェクト）

---

### Phase 4: 安定化とフォールバック
**目標**: WebGL非対応環境への対応
**実装時間**: 30分
**リスク**: 低

#### タスクリスト
- [ ] WebGL対応チェック関数
- [ ] Canvas 2Dフォールバック実装
- [ ] ブラウザ互換性テスト（Chrome, Edge, Firefox, Safari）
- [ ] モバイル動作確認（Android Chrome, iOS Safari）

---

## Phase 1 詳細実装

### 1. main.ts修正（1行変更）
```typescript
// src/main.ts
p.setup = () => {
    // v1.2: WEBGLモードに変更
    const canvas = p.createCanvas(800, 600, p.WEBGL);
    canvas.parent('canvasArea');
    canvas.id('canvas');

    // ...既存コード
}
```

### 2. 座標系保護（各View.draw()の先頭に追加）
```typescript
// src/PlantView.ts, FractalPlantView.ts, VisualizerView.ts
draw(p: p5): void {
    // v1.2: WEBGL座標系を2D互換に変換（左上原点）
    p.translate(-p.width / 2, -p.height / 2);

    // ...既存の描画コード（変更なし）
}
```

**なぜtranslateが必要か:**
- Canvas 2D: 座標原点は左上 (0, 0)
- WEBGL: 座標原点は中央 (width/2, height/2)
- `translate(-width/2, -height/2)`で左上原点に戻す

---

## ロールバック手順（問題発生時）
```typescript
// main.ts: 元に戻す（2分で完了）
const canvas = p.createCanvas(800, 600);  // p.WEBGL削除

// 各View: translate削除
// draw(p: p5): void {
//     p.translate(-p.width / 2, -p.height / 2);  ← この行削除
```

---

## 期待されるパフォーマンス向上

| 項目 | v1.1.1 (Canvas 2D) | v1.2 Phase 1 (WEBGL基盤) | v1.2 Phase 2 (粒子3D化) |
|------|-------------------|------------------------|---------------------|
| 粒子数 | 500個 | 500個 | 10000個 |
| CPU使用率 | 20% | 20% | 10% |
| GPU使用率 | 0% | 0% | 40% |
| FPS | 60fps | 60fps | 60fps |
| 描画API | Canvas 2D | Canvas 2D (互換) | WebGL (sphere) |

---

## リスク評価

### Phase 1（WEBGL基盤）
- **リスク**: 極低
- **影響範囲**: main.ts（1行）、各View（3行×3ファイル）
- **ロールバック**: 2分
- **互換性**: 100%（既存コード変更不要）

### Phase 2（粒子3D化）
- **リスク**: 中
- **影響範囲**: ParticleSystem.ts
- **ロールバック**: 5分
- **互換性**: 95%（粒子の見た目が3D球体に変わる）

---

## 実装順序

1. **Phase 1（今から）**: WEBGL基盤 → 互換性確認
2. **Phase 2（Phase 1成功後）**: 粒子3D化 → パフォーマンステスト
3. **Phase 3（オプション）**: 3D演出追加
4. **Phase 4**: 安定化とフォールバック

---

**作成日**: 2025-10-07
**対象バージョン**: v1.1.1 → v1.2
**優先度**: 高（パフォーマンス大幅向上）
**推定時間**: Phase 1-2で1時間、Phase 3-4で2-3時間

# Update 1.1.1 - Critical Bug Fixes

## 発見された問題点

### ①Canvas中央配置問題
- **現象**: Canvas要素が左寄せになっている
- **原因**: p5.jsが`canvas.style`でインラインスタイルを設定するため、CSS `!important`が効かない
- **影響度**: 中（視覚的な問題）

### ②コンソール視認性問題
- **現象**: コンソールのテキストが見えにくい（黒背景に黒字）
- **原因**: ブラウザキャッシュで古いCSSが読み込まれている
- **影響度**: 高（ユーザビリティ）

### ③Clear/ひび割れ消失問題
- **現象**: Clear後すぐにメッセージとひび割れが消える
- **原因**: ブラウザキャッシュで古いbundle.jsが使用されている
- **影響度**: 高（v1.0コア機能）

### ④**Fractal難易度とクリア判定ずれ（最重要バグ）**
- **現象**: スライダーで難易度を下げても、植物がゴールラインに達していないのにクリアになる
- **原因1**: 壁の描画位置が`0.8 * 400`固定で、`clearThreshold`に連動していない
- **原因2**: FractalPlantViewのClear判定が`smoothedVolume > clearThreshold`だが、Fractalは`accumulatedHeight`で成長するため判定がずれている
- **影響度**: 致命的（ゲームロジック破綻）

---

## 修正タスクリスト

### Phase 1: キャッシュバスター追加
- [x] index.htmlにCSSとJSにクエリパラメータ追加（`?v=1.1.1`）
- [x] ブラウザキャッシュ問題を根本解決

### Phase 2: Canvas中央配置修正
- [x] main.tsのp.setup()内でcanvas.style.widthとheightを直接設定
- [x] CSSの`!important`では効かない問題を回避

### Phase 3: 壁の位置をclearThresholdに連動
- [x] PlantView.ts: `clearLineY`計算を`this.clearThreshold * 400`に修正
- [x] FractalPlantView.ts: `clearLineY`計算を`this.clearThreshold * 400`に修正
- [x] 壁の描画位置とスライダーの値を完全一致させる

### Phase 4: FractalのClear判定をaccumulatedHeightベースに修正（最重要）
- [x] FractalPlantView.ts: Clear判定を`smoothedVolume > clearThreshold`から修正
- [x] 正しい判定: `accumulatedHeight >= (clearThreshold * 400)`に変更
- [x] PlantViewも同様にチェック（こちらは`smoothedVolume`で正しい）

### Phase 5: 動作確認
- [ ] ブラウザハードリロード（Ctrl+Shift+R）
- [ ] Canvas中央配置を目視確認
- [ ] コンソール視認性を確認（緑色テキストが読める）
- [ ] Clearスライダーを0.5に下げて、壁の位置が下に移動することを確認
- [ ] FractalPlantViewで植物が壁に到達した瞬間にClrearすることを確認
- [ ] PlantViewでも同様に確認
- [ ] Clear後に「Clear!」メッセージが表示され続けることを確認
- [ ] Clear後にひび割れが残り続けることを確認

---

## 詳細修正内容

### 1. キャッシュバスター
```html
<!-- index.html -->
<link rel="stylesheet" href="css/style.css?v=1.1.1">
<script type="module" src="dist/bundle.js?v=1.1.1"></script>
```

### 2. Canvas中央配置（JavaScript）
```typescript
// src/main.ts
p.setup = () => {
    const canvas = p.createCanvas(800, 600);
    canvas.parent('canvasArea');
    canvas.id('canvas');

    // インラインstyleで強制設定
    const canvasElement = document.getElementById('canvas');
    if (canvasElement) {
        canvasElement.style.width = '800px';
        canvasElement.style.height = '600px';
        canvasElement.style.display = 'block';
    }
    // ...
}
```

### 3. 壁の位置をclearThresholdに連動
```typescript
// src/PlantView.ts & src/views/experimental/FractalPlantView.ts
draw(p: p5): void {
    const baseY = p.height * 0.9;
    const clearLineY = baseY - (this.clearThreshold * 400); // ← 0.8を削除
    const wallY = clearLineY;
    // ...
}
```

### 4. FractalのClear判定修正（最重要）
```typescript
// src/views/experimental/FractalPlantView.ts
draw(p: p5): void {
    // ...

    // v1.0改: Clear!判定（accumulatedHeightベース）
    if (this.accumulatedHeight >= (this.clearThreshold * 400) && !this.clearTriggered && this.plantState === 'growing') {
        this.transitionToCleared();
    }

    // ...
}
```

**PlantView.tsは変更不要**（smoothedVolumeベースで正しい）:
```typescript
// src/PlantView.ts（変更なし）
if (this.smoothedVolume > this.clearThreshold && !this.clearTriggered && this.plantState === 'growing') {
    this.transitionToCleared();
}
```

---

## 期待される結果

1. **Canvas**: 画面左エリアの中央に800x600で表示
2. **コンソール**: 緑色のテキストが明瞭に読める
3. **Clearスライダー**: 0.5〜1.0で壁の位置が連動して上下する
4. **Fractal植物**: 壁の位置まで到達した瞬間にClearトリガー（音量ではなく高さ基準）
5. **Plant植物**: 音量0.8以上で壁の位置に達した瞬間にClearトリガー
6. **Clear後**: 「Clear!」メッセージとひび割れが表示され続ける

---

## リスク評価

- **Phase 1-2**: 低リスク（既存機能に影響なし）
- **Phase 3**: 中リスク（壁の位置変更、視覚的影響）
- **Phase 4**: 高リスク（ゲームロジック変更、慎重なテストが必要）

---

## 実装順序

1. Phase 1（キャッシュバスター） → 即座に効果
2. Phase 2（Canvas中央） → 視覚改善
3. Phase 3（壁の位置連動） → スライダー機能完成
4. Phase 4（Fractal判定修正） → 最重要バグ修正
5. Phase 5（動作確認） → 全体テスト

---

**作成日**: 2025-10-07
**対象バージョン**: v1.0 → v1.1.1
**優先度**: 緊急（Phase 4は致命的バグ）

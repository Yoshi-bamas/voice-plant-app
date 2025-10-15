# WebGL演出アイデア集（v1.2+対応）

**現在の技術基盤:** p5.js WEBGL, TypeScript Strict, 粒子数5000個対応, SimplexNoise

---

## 💡 アイデア1: ダイナミックカメラワーク（音量連動）

### 演出・アニメーション
- 音量に応じてカメラが前後に移動（0.8以上でズームイン、静かでズームアウト）
- 周波数で左右にゆっくり揺れる（低音→左、高音→右）
- Clear時に植物を中心に360度回転しながらズームアップ
- 「映画的な演出」でユーザーを没入させる

### 実装手法
```typescript
// PlantView.draw() または専用CameraControllerクラス
draw(p: p5): void {
    // 音量でカメラZ座標を制御（近づく・遠ざかる）
    const cameraZ = p.map(this.smoothedVolume, 0, 1, 600, 200);
    const cameraX = p.sin(p.frameCount * 0.01) * this.frequency * 50; // 周波数で左右

    p.camera(
        cameraX, 0, cameraZ,  // カメラ位置
        0, 0, 0,              // 注視点（植物の中心）
        0, 1, 0               // 上方向ベクトル
    );

    // Clear時の回転演出
    if (this.plantState === 'cleared') {
        const angle = (p.frameCount - this.clearFrame) * 0.02;
        const radius = 400;
        p.camera(
            p.cos(angle) * radius, -100, p.sin(angle) * radius,
            0, 0, 0,
            0, 1, 0
        );
    }

    // ... 植物描画
}
```

### 実装手法の解説
- **p5.camera()**: 3D空間での視点を制御。9パラメータ（カメラ位置x,y,z / 注視点x,y,z / 上方向x,y,z）
- **音量マッピング**: `p.map(volume, 0, 1, 600, 200)` で遠→近への距離変化
- **周波数揺れ**: `sin(frameCount)`で滑らかな左右往復、周波数を乗算で強度調整
- **Clear回転**: 極座標（`cos/sin`）でカメラを円周上に移動、frameCountベースで時間経過
- **パフォーマンス**: カメラ計算はCPU負荷が低い（毎フレーム実行OK）

---

## 💡 アイデア2: 3D粒子トルネード（螺旋上昇）

### 演出・アニメーション
- 粒子がらせん状に上昇しながら回転（DNA二重螺旋のイメージ）
- 音量で上昇速度が変化、周波数で螺旋の半径が広がる
- Clear時は螺旋が爆発的に拡散、キラキラと散っていく
- 奥行き感のある3D表現で視覚的インパクト大

### 実装手法
```typescript
// Particle.ts に3D座標とZ軸回転を追加
export class Particle3D {
    private z: number = 0;
    private angleY: number; // Y軸周りの角度
    private radius: number; // 螺旋半径

    constructor(x: number, y: number, speed: number, angle: number, color: [number, number, number]) {
        // ... 既存コード
        this.angleY = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 50 + 30;
    }

    update(): void {
        // 螺旋上昇
        this.y -= this.vy; // 上方向に移動
        this.angleY += 0.05; // 回転速度
        this.x = this.startX + Math.cos(this.angleY) * this.radius;
        this.z = Math.sin(this.angleY) * this.radius;

        // 周波数で半径拡大
        this.radius += this.frequencyBoost * 0.5;

        this.life--;
    }
}

// ParticleSystem.draw()
draw(p: p5): void {
    this.particles.forEach(particle => {
        p.push();
        p.translate(particle.x, particle.y, particle.z); // 3D座標
        p.noStroke();
        p.fill(particle.r, particle.g, particle.b, particle.life * 2);
        p.sphere(particle.size); // 3D球体
        p.pop();
    });
}
```

### 実装手法の解説
- **極座標系**: `x = cos(angle) * radius`, `z = sin(angle) * radius` でXZ平面上の円運動
- **Y軸上昇**: 従来の`vy`をそのまま使用、上方向（-Y）に移動
- **angleY更新**: 毎フレーム0.05ラジアン（約3度）ずつ回転 → 1秒で約180度回転
- **半径動的変化**: 周波数データを乗算して螺旋が広がる演出
- **sphere()**: WebGL専用、2D版のcircle()より描画コストは若干高いがGPU並列処理で5000個でも60fps維持
- **translate()順序**: x,y,z の順で指定、Z軸は手前（正）／奥（負）

---

## 💡 アイデア3: カスタムシェーダーグロー（発光植物）

### 演出・アニメーション
- 植物全体が内側から発光（音量が高いほど明るく）
- 葉脈に沿って電流が流れるような光のパルス
- Clear時は全体が白く発光してからゆっくり消える（核爆発の逆再生）
- シェーダー特有の滑らかなグラデーション

### 実装手法
```typescript
// shaders/glow.vert（頂点シェーダー）
attribute vec3 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec2 vTexCoord;

void main() {
    vec4 positionVec4 = vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
    vTexCoord = aTexCoord;
}

// shaders/glow.frag（フラグメントシェーダー）
precision mediump float;
varying vec2 vTexCoord;
uniform float uVolume;      // 音量（0-1）
uniform float uTime;        // 時間
uniform vec3 uBaseColor;    // 基本色

void main() {
    // 中心からの距離でグロー計算
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vTexCoord, center);

    // パルス効果（sin波で明滅）
    float pulse = sin(uTime * 3.0 - dist * 10.0) * 0.5 + 0.5;

    // 音量で発光強度を制御
    float glow = (1.0 - dist) * uVolume * pulse;

    vec3 color = uBaseColor + vec3(glow);
    gl_FragColor = vec4(color, 1.0);
}

// PlantView.ts でシェーダー読み込み
private glowShader: p5.Shader | null = null;

setup(p: p5): void {
    this.glowShader = p.loadShader('shaders/glow.vert', 'shaders/glow.frag');
}

draw(p: p5): void {
    p.shader(this.glowShader);
    this.glowShader.setUniform('uVolume', this.smoothedVolume);
    this.glowShader.setUniform('uTime', p.millis() / 1000.0);
    this.glowShader.setUniform('uBaseColor', [0.0, 0.8, 0.0]); // 緑色

    // 植物描画（シェーダーが適用される）
    drawStem(p, this.smoothedVolume, this.frequency);
}
```

### 実装手法の解説
- **GLSL**: OpenGL Shading Language、GPU上で実行される高速描画言語
- **頂点シェーダー**: 各頂点の位置を計算（行列変換）
- **フラグメントシェーダー**: 各ピクセルの色を計算（ここでグロー効果）
- **varying変数**: 頂点→フラグメント間でデータ受け渡し（vTexCoord）
- **uniform変数**: JavaScript側から値を渡す（音量、時間、色）
- **distance計算**: テクスチャ座標（0-1）での中心からの距離 → 外側ほど暗く
- **sin波パルス**: `sin(time - dist * 10)` で波紋状に広がる明滅
- **パフォーマンス**: GPU並列処理、全ピクセル同時計算で超高速
- **注意点**: シェーダーファイルは外部読み込み（index.htmlのscript内埋め込みも可）

---

## 💡 アイデア4: テクスチャマッピング（リアル葉脈・樹皮）

### 演出・アニメーション
- 葉に実写の葉脈テクスチャを貼り付け、リアリティ向上
- 茎に樹皮のテクスチャ、凹凸感を法線マップで表現
- 音量で葉の透明度が変化（薄→濃）
- Clear時は葉がキラキラの粒子テクスチャに変化

### 実装手法
```typescript
// PlantView.ts でテクスチャ読み込み
private leafTexture: p5.Image | null = null;
private barkTexture: p5.Image | null = null;

preload(p: p5): void {
    this.leafTexture = p.loadImage('assets/leaf-texture.png');
    this.barkTexture = p.loadImage('assets/bark-texture.jpg');
}

drawLeafWithTexture(p: p5, x: number, y: number, size: number): void {
    p.push();
    p.translate(x, y, 0);

    // テクスチャを有効化
    p.texture(this.leafTexture);
    p.noStroke();

    // 四角形ポリゴンに葉テクスチャをマッピング
    p.beginShape();
    p.vertex(-size, -size, 0,   0, 0);    // 左上 (UV: 0,0)
    p.vertex(size, -size, 0,    1, 0);    // 右上 (UV: 1,0)
    p.vertex(size, size, 0,     1, 1);    // 右下 (UV: 1,1)
    p.vertex(-size, size, 0,    0, 1);    // 左下 (UV: 0,1)
    p.endShape(p.CLOSE);

    p.pop();
}

// 茎（円柱）にテクスチャ
drawStemWithTexture(p: p5, height: number): void {
    p.push();
    p.translate(p.width/2, p.height * 0.9, 0);

    p.texture(this.barkTexture);
    p.rotateX(p.PI); // 円柱を縦向きに
    p.cylinder(8, height); // 半径8px, 高さvolume連動

    p.pop();
}
```

### 実装手法の解説
- **p.loadImage()**: PNG/JPG画像を読み込み、preload()で事前ロード
- **p.texture()**: 次に描画する形状にテクスチャを適用
- **UV座標**: vertex()の4,5番目の引数（0-1の範囲でテクスチャ上の位置指定）
- **vertex座標とUVの対応**:
  - `vertex(-size, -size, 0, 0, 0)` → 左上の頂点にテクスチャ左上を貼る
  - `vertex(size, size, 0, 1, 1)` → 右下の頂点にテクスチャ右下を貼る
- **cylinder()**: WebGL専用の円柱プリミティブ、`rotateX(PI)`で縦向き
- **画像準備**: assets/フォルダに配置、透過PNG推奨（葉の縁）
- **パフォーマンス**: テクスチャはGPUメモリにキャッシュ、描画コストほぼゼロ
- **法線マップ**: さらにリアル感を出すには`normalMaterial()`と組み合わせ

---

## 💡 アイデア5: ダイナミックライティング（音に反応する照明）

### 演出・アニメーション
- 音量に応じてポイントライトの明るさが変化（脈動する光）
- 周波数でライトの色が変化（低音→青、高音→赤）
- 複数のライトが植物の周りを回転（スポットライト3つ）
- Clear時は全方位から白い光が収束、植物がシルエット化

### 実装手法
```typescript
// PlantView.draw() 内でライティング設定
draw(p: p5): void {
    // 座標系変換
    p.translate(-p.width/2, -p.height/2, 0);

    // 環境光（ベース）
    p.ambientLight(30, 30, 30);

    // 音量で明るさが変化するポイントライト（手前）
    const brightness = p.map(this.smoothedVolume, 0, 1, 50, 255);
    p.pointLight(brightness, brightness, brightness, 0, 0, 200);

    // 周波数で色が変化する方向性ライト
    const hue = this.frequency * 360; // 0-360度
    const [r, g, b] = hslToRgb(hue, 1, 0.5);
    p.directionalLight(r, g, b, 0.5, 0.5, -1); // 斜め上から

    // 回転するスポットライト（3つ）
    for (let i = 0; i < 3; i++) {
        const angle = (p.frameCount * 0.02) + (i * Math.PI * 2 / 3);
        const lightX = Math.cos(angle) * 200;
        const lightZ = Math.sin(angle) * 200;

        p.pointLight(
            100, 200, 255,    // 青白い光
            lightX, -100, lightZ
        );
    }

    // Clear時の収束光
    if (this.plantState === 'cleared') {
        const clearIntensity = 255 - ((p.frameCount - this.clearFrame) * 2);
        p.ambientLight(clearIntensity, clearIntensity, clearIntensity);
    }

    // 植物描画（ライティングが適用される）
    drawStem(p, this.smoothedVolume, this.frequency);
}
```

### 実装手法の解説
- **ambientLight()**: 全方位から均一に照らす環境光、影なし
- **pointLight()**: 1点から全方位に照らす点光源、距離で減衰
  - パラメータ: `(r, g, b, x, y, z)` 色と位置
- **directionalLight()**: 無限遠から特定方向に照らす平行光、太陽光のイメージ
  - パラメータ: `(r, g, b, dx, dy, dz)` 色と方向ベクトル
- **spotLight()**: 懐中電灯のような円錐状の光（未使用だが実装可能）
- **ライト数制限**: p5.jsは最大8個のライト同時使用可能
- **極座標回転**: `cos/sin(frameCount * speed)` で円周上を等速移動
- **3つの配置**: `i * 2π/3` で120度ずつ均等配置
- **パフォーマンス**: ライト計算はやや重い、3-5個程度が実用的
- **マテリアル**: `normalMaterial()` や `specularMaterial()` でライトの反射表現

---

## 💡 アイデア6: 画面遷移3D回転（View切替演出）

### 演出・アニメーション
- PlantView → VisualizerView 切替時、画面が立方体のように回転
- 切替ボタンを押すと現在の画面が奥に回転、新しい画面が手前に
- イージング（加速→減速）で滑らかな遷移
- ローディング中は回転する粒子リング表示

### 実装手法
```typescript
// ViewManager.ts に遷移アニメーション追加
export class ViewManager {
    private isTransitioning: boolean = false;
    private transitionProgress: number = 0; // 0-1
    private transitionDuration: number = 60; // フレーム数（約1秒）
    private nextViewType: 'plant' | 'visualizer' | 'fractal' | null = null;

    switchView(viewType: 'plant' | 'visualizer' | 'fractal'): void {
        if (this.isTransitioning) return;

        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.nextViewType = viewType;
    }

    draw(p: p5): void {
        if (this.isTransitioning) {
            this.updateTransition();
            this.drawTransition(p);
        } else {
            this.currentView.draw(p);
        }
    }

    private updateTransition(): void {
        this.transitionProgress += 1 / this.transitionDuration;

        if (this.transitionProgress >= 1) {
            // 遷移完了
            this.currentViewType = this.nextViewType!;
            this.updateCurrentView();
            this.isTransitioning = false;
            this.transitionProgress = 0;
        }
    }

    private drawTransition(p: p5): void {
        // イージング関数（ease-in-out）
        const t = this.transitionProgress;
        const eased = t < 0.5
            ? 2 * t * t
            : -1 + (4 - 2 * t) * t;

        // 現在のビューを描画（回転させながら奥に）
        p.push();
        p.rotateY(eased * p.PI); // 0→180度回転
        p.translate(0, 0, -eased * 200); // 奥に移動

        // オフスクリーンバッファに描画してテクスチャ化（高度な実装）
        // または半透明化で消えていく演出
        p.tint(255, (1 - eased) * 255);
        this.currentView.draw(p);
        p.pop();

        // 次のビューを描画（手前に出現）
        if (eased > 0.5) {
            p.push();
            p.rotateY((eased - 1) * p.PI); // -180→0度回転
            p.translate(0, 0, (1 - eased) * 200);

            // 次のビュー取得（仮）
            const nextView = this.getViewByType(this.nextViewType!);
            nextView.draw(p);
            p.pop();
        }
    }
}
```

### 実装手法の解説
- **遷移フラグ**: `isTransitioning` で通常描画と遷移描画を切り替え
- **progress管理**: 0-1の範囲で遷移進行度を表現、毎フレーム`1/60`ずつ増加
- **イージング関数**: ease-in-out（開始と終了が滑らか）
  - `t < 0.5`: 加速フェーズ（2次曲線）
  - `t >= 0.5`: 減速フェーズ（2次曲線の逆）
- **rotateY()**: Y軸周りの回転、π（180度）で裏返る
- **translate Z**: 奥行き移動、負の値で奥へ
- **tint()**: テクスチャやビュー全体の不透明度制御
- **オフスクリーンバッファ**: `p.createGraphics()`でビューを事前描画してテクスチャ化（パフォーマンス向上）
- **パフォーマンス**: 遷移中は2つのビュー描画でやや重い、60フレーム（1秒）が妥当
- **拡張案**: 立方体の各面に異なるビュー配置、ルービックキューブ風UI

---

## 💡 アイデア7: パーティクルトレイル（軌跡エフェクト）

### 演出・アニメーション
- 粒子が移動した軌跡を線で描画（流れ星のような尾）
- 音量が大きいほど軌跡が長く、明るく
- 軌跡は徐々にフェードアウト（透明度減少）
- Clear時は軌跡が螺旋状に収束して消える

### 実装手法
```typescript
// Particle.ts に履歴配列追加
export class ParticleWithTrail {
    private trail: Array<{x: number, y: number, z: number, alpha: number}> = [];
    private maxTrailLength: number = 20; // 軌跡の最大長

    update(): void {
        // 現在位置を履歴に追加
        this.trail.push({
            x: this.x,
            y: this.y,
            z: this.z,
            alpha: this.life / this.maxLife // 初期透明度
        });

        // 古い履歴を削除
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // 透明度を減衰
        this.trail.forEach(point => {
            point.alpha *= 0.95; // 毎フレーム5%減衰
        });

        // 粒子の移動（既存コード）
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
}

// ParticleSystem.draw()
draw(p: p5): void {
    this.particles.forEach(particle => {
        // 軌跡を描画（線）
        p.stroke(particle.r, particle.g, particle.b);
        p.noFill();

        p.beginShape();
        particle.trail.forEach(point => {
            p.strokeWeight(2);
            p.stroke(particle.r, particle.g, particle.b, point.alpha * 255);
            p.vertex(point.x, point.y, point.z);
        });
        p.endShape();

        // 粒子本体を描画
        p.push();
        p.translate(particle.x, particle.y, particle.z);
        p.noStroke();
        p.fill(particle.r, particle.g, particle.b, particle.life * 2);
        p.sphere(particle.size);
        p.pop();
    });
}
```

### 実装手法の解説
- **履歴配列**: 過去N個の座標を配列で保存、`push()`で追加、`shift()`で削除
- **maxTrailLength**: 軌跡の長さ制御、20なら20フレーム分（約0.3秒）
- **透明度管理**: 各座標に`alpha`値を持たせ、毎フレーム減衰（`*= 0.95`）
- **beginShape/vertex**: 連続する頂点を線でつなぐ、3D座標対応
- **strokeWeight()**: 線の太さ、音量で変化させても面白い
- **パフォーマンス**: 5000粒子×20履歴 = 10万頂点、やや重い
  - 対策: 軌跡を間引く（2フレームごとに記録）
  - 対策: 最大粒子数を制限（軌跡付きは500個まで等）
- **発展案**: 軌跡にテクスチャ（光の帯）、ベジェ曲線で滑らかに

---

## 💡 アイデア8: 深度フォグ（奥行き表現強化）

### 演出・アニメーション
- 遠くの粒子ほど霞んで見える（大気遠近法）
- 音量でフォグの濃さが変化（静か→濃霧、声大→クリア）
- 周波数でフォグの色が変化（低音→青霧、高音→赤霧）
- Clear時はフォグが晴れて視界良好

### 実装手法
```typescript
// PlantView.draw() 内でフォグ設定
draw(p: p5): void {
    // フォグの濃さを音量で制御（0.6→薄い、0.95→濃い）
    const fogDensity = p.map(this.smoothedVolume, 0, 1, 0.95, 0.6);

    // フォグの色を周波数で制御
    const hue = this.frequency * 240; // 0-240度（青→緑→黄→赤）
    const [r, g, b] = hslToRgb(hue, 0.3, 0.2); // 低彩度、低明度

    // p5.jsにはfog()がないため、シェーダーで実装
    // または手動でZ座標に応じて透明度を調整

    this.particles.draw(p);
}

// ParticleSystem.draw() で深度ベース透明度
draw(p: p5): void {
    this.particles.forEach(particle => {
        // カメラからの距離を計算
        const distanceFromCamera = Math.abs(particle.z);

        // 距離に応じて透明度を減衰（フォグ効果）
        const fogStart = 100;  // フォグ開始距離
        const fogEnd = 500;    // 完全に霞む距離
        const fogFactor = p.constrain(
            p.map(distanceFromCamera, fogStart, fogEnd, 1, 0),
            0, 1
        );

        p.push();
        p.translate(particle.x, particle.y, particle.z);
        p.noStroke();

        // フォグ色とブレンド
        const finalR = p.lerp(particle.r, this.fogColorR, 1 - fogFactor);
        const finalG = p.lerp(particle.g, this.fogColorG, 1 - fogFactor);
        const finalB = p.lerp(particle.b, this.fogColorB, 1 - fogFactor);
        const finalAlpha = particle.life * 2 * fogFactor;

        p.fill(finalR, finalG, finalB, finalAlpha);
        p.sphere(particle.size);
        p.pop();
    });
}
```

### 実装手法の解説
- **深度計算**: 粒子のZ座標（カメラからの距離）で透明度決定
- **fogStart/fogEnd**: フォグの有効範囲、線形補間で滑らか
- **p.map()**: 距離を0-1の範囲にマッピング、`constrain()`でクランプ
- **p.lerp()**: 線形補間、粒子色とフォグ色をブレンド
  - `lerp(particleColor, fogColor, 0)` → 粒子色100%
  - `lerp(particleColor, fogColor, 1)` → フォグ色100%
- **シェーダー版**: GLSLで実装すればより高速
  ```glsl
  float fog = clamp((gl_FragCoord.z - fogStart) / (fogEnd - fogStart), 0.0, 1.0);
  gl_FragColor.rgb = mix(particleColor, fogColor, fog);
  ```
- **パフォーマンス**: 透明度計算は軽量、全粒子に適用可能
- **視覚効果**: 3D感が劇的に向上、奥行き認識しやすくなる

---

## 💡 アイデア9: 3D浮遊UI（ホログラムコンソール）

### 演出・アニメーション
- コンソールUIが3D空間に浮遊（半透明パネル）
- Viewボタンが立体的に浮き、ホバーで手前に飛び出す
- スライダーが光る軌道、つまみが3D球体
- 音量メーターが3D波形（オシロスコープ風）

### 実装手法
```typescript
// 新規: UI3DManager.ts
export class UI3DManager {
    draw(p: p5, audioData: {volume: number, frequency: number}): void {
        // 3D UIパネル（右側に配置）
        p.push();
        p.translate(300, 0, 50); // Canvas右側、手前

        // 半透明パネル
        p.fill(26, 26, 26, 200); // 透明度200/255
        p.stroke(0, 255, 0, 150);
        p.strokeWeight(2);
        p.box(280, 500, 10); // 横280, 縦500, 奥行き10

        p.pop();

        // 音量メーター（3D波形）
        this.drawVolumeWaveform(p, audioData.volume);

        // Viewボタン（3D立方体）
        this.drawViewButtons(p);
    }

    private drawVolumeWaveform(p: p5, volume: number): void {
        p.push();
        p.translate(250, -150, 60);

        // 過去60フレームの音量を記録
        this.volumeHistory.push(volume);
        if (this.volumeHistory.length > 60) {
            this.volumeHistory.shift();
        }

        // 波形を3D線で描画
        p.stroke(0, 255, 0);
        p.strokeWeight(3);
        p.noFill();
        p.beginShape();

        this.volumeHistory.forEach((v, i) => {
            const x = (i - 30) * 4; // -120 ~ +120
            const y = v * -50;       // 音量で高さ
            const z = i * 0.5;       // 奥行き（時間軸）
            p.vertex(x, y, z);
        });
        p.endShape();

        p.pop();
    }

    private drawViewButtons(p: p5): void {
        const buttons = ['Plant', 'Visualizer', 'Fractal'];

        buttons.forEach((label, i) => {
            p.push();
            p.translate(250, -50 + i * 80, 70);

            // ホバー判定（簡易版、マウス座標変換が必要）
            const isHovered = false; // TODO: 実装
            const depth = isHovered ? 20 : 10;

            // ボタン立方体
            p.fill(0, 255, 0, isHovered ? 255 : 100);
            p.stroke(0, 255, 0);
            p.strokeWeight(2);
            p.box(200, 50, depth);

            // テキスト（2D overlay、または3D text）
            // p5.jsの3Dテキストは難しいため、2D重ね描きが実用的

            p.pop();
        });
    }
}

// main.ts で統合
const ui3D = new UI3DManager();
p.draw = () => {
    // ... 既存描画
    ui3D.draw(p, { volume: audioAnalyzer.getVolume(), frequency: audioAnalyzer.getFrequency().average });
};
```

### 実装手法の解説
- **box()**: WebGL専用、直方体プリミティブ（幅、高さ、奥行き）
- **半透明**: `fill(r, g, b, alpha)`、alphaは0-255
- **translate配置**: Canvas右側（X+300）、手前（Z+50）に配置
- **波形履歴**: 配列で過去Nフレームの音量を保存、時系列で描画
- **3D線描画**: `beginShape() / vertex(x,y,z) / endShape()` で立体パス
- **ホバー判定**: 3D→2Dスクリーン座標変換が必要（やや複雑）
  - `p.screenX(x, y, z)` / `p.screenY(x, y, z)` で変換
  - マウス座標と比較して判定
- **テキスト問題**: p5.jsは3Dテキストが不得意
  - 解決策1: 2D UIを最後に重ね描き（`p.ortho()`で射影切替）
  - 解決策2: テクスチャ画像としてテキスト描画
  - 解決策3: HTMLのDOMを3D CSS transformで配置
- **パフォーマンス**: UI描画は軽量、マウスイベント処理がボトルネック
- **拡張案**: VR風の手でつまめるUI、視線追跡

---

## 💡 アイデア10: 音響ビジュアライザー3D球体版

### 演出・アニメーション
- 周波数スペクトラムを球体表面に配置（全方向に突起）
- 各周波数バンドが球体から外向きに伸びる棒（hedgehog）
- 音量で球体が脈動（拡大・縮小）
- 色はレインボーグラデーション、回転しながら表示

### 実装手法
```typescript
// VisualizerView.ts を3D版に拡張
export class Visualizer3DView implements IView {
    private rotationY: number = 0;

    draw(p: p5): void {
        p.translate(-p.width/2, -p.height/2, 0);

        const bands = audioAnalyzer.getFrequencyBands();
        const segmentCount = bands.length; // 128バンド

        // 球体の基本半径
        const baseRadius = 100;
        const pulsation = this.volume * 30; // 音量で脈動
        const radius = baseRadius + pulsation;

        // 球体を回転
        p.push();
        p.translate(p.width/2, p.height/2, 0);
        p.rotateY(this.rotationY);
        this.rotationY += 0.01;

        // 球体表面に周波数バンドを配置
        for (let i = 0; i < segmentCount; i++) {
            const theta = p.map(i, 0, segmentCount, 0, p.PI);        // 緯度（0-180度）
            const phi = p.map(i, 0, segmentCount, 0, p.TWO_PI * 4);  // 経度（0-720度、螺旋）

            // 球面座標→直交座標
            const x = radius * p.sin(theta) * p.cos(phi);
            const y = radius * p.cos(theta);
            const z = radius * p.sin(theta) * p.sin(phi);

            // 周波数の強さで棒の長さ決定
            const barLength = bands[i] * 100;

            // 色（レインボー）
            const hue = (i / segmentCount) * 360;
            const [r, g, b] = hslToRgb(hue, 1, 0.5);

            // 棒を描画（球面から外向き）
            p.push();
            p.translate(x, y, z);

            // 球の中心方向を向く
            const centerVec = p.createVector(0, 0, 0);
            const posVec = p.createVector(x, y, z);
            const direction = p5.Vector.sub(posVec, centerVec).normalize();

            // 回転行列で方向合わせ（省略可、代わりに単純な線）
            p.stroke(r, g, b);
            p.strokeWeight(3);
            p.line(0, 0, 0, direction.x * barLength, direction.y * barLength, direction.z * barLength);

            // 先端に球体
            p.translate(direction.x * barLength, direction.y * barLength, direction.z * barLength);
            p.fill(r, g, b);
            p.noStroke();
            p.sphere(5);

            p.pop();
        }

        p.pop();
    }
}
```

### 実装手法の解説
- **球面座標系**: `(r, θ, φ)` → `(x, y, z)`
  - `x = r * sin(θ) * cos(φ)`
  - `y = r * cos(θ)`
  - `z = r * sin(θ) * sin(φ)`
  - θ（シータ）: 緯度（0-180度、北極→南極）
  - φ（ファイ）: 経度（0-360度、一周）
- **螺旋配置**: φを`TWO_PI * N`（Nは螺旋の巻き数）にすると螺旋状に配置
- **createVector()**: p5のベクトル演算、方向計算に便利
- **normalize()**: ベクトルの長さを1に正規化、方向だけ取得
- **line()**: 始点と終点を指定して線描画、3D座標対応
- **回転行列**: 厳密には棒の向きを球面法線方向に合わせる必要あり
  - 簡易版: `line()`で十分、計算コスト削減
  - 高度版: `applyMatrix()`でカスタム回転行列
- **パフォーマンス**: 128バンド×フレーム = 中程度、60fps維持可能
- **拡張案**: 球体を複数配置（低音・中音・高音で3つ）、パーティクルを球面に吸着

---

## 実装優先度と組み合わせ案

### 🥇 優先度A（即実装可能、効果大）
1. **アイデア1: ダイナミックカメラワーク** → 没入感向上、実装簡単
2. **アイデア5: ダイナミックライティング** → 視覚的インパクト大、中程度実装
3. **アイデア8: 深度フォグ** → 3D感向上、実装簡単

### 🥈 優先度B（中期実装、差別化要素）
4. **アイデア2: 3D粒子トルネード** → 独自性高い、中程度実装
5. **アイデア10: 音響ビジュアライザー3D球体版** → VisualizerViewの強化
6. **アイデア6: 画面遷移3D回転** → UX向上、やや複雑

### 🥉 優先度C（長期実装、リソース必要）
7. **アイデア4: テクスチャマッピング** → 画像素材準備必要
8. **アイデア3: カスタムシェーダーグロー** → GLSL学習コスト
9. **アイデア7: パーティクルトレイル** → パフォーマンス調整必要
10. **アイデア9: 3D浮遊UI** → UIロジック大幅改修

### 推奨組み合わせ（v1.3リリース想定）
```
基本演出:
- アイデア1（カメラワーク）
- アイデア5（ライティング）
- アイデア8（フォグ）

粒子強化:
- アイデア2（トルネード）
- アイデア7（トレイル、簡易版）

Visualizer強化:
- アイデア10（3D球体）

UI改善（オプショナル）:
- アイデア6（画面遷移）
```

---

## パフォーマンス目標

| 実装内容 | 推定fps | GPU使用率 | 備考 |
|---------|---------|----------|------|
| カメラワーク単体 | 60fps | +5% | 軽量 |
| ライティング3個 | 55fps | +15% | やや重い |
| 深度フォグ | 58fps | +10% | 軽量 |
| トルネード粒子5000個 | 50fps | +30% | 重い |
| シェーダーグロー | 60fps | +20% | GPU効率的 |
| **全部盛り** | 45-50fps | +60% | 要最適化 |

**最適化戦略:**
- 粒子数動的調整（fps < 50で自動削減）
- ライト数制限（最大3個）
- 軌跡長さ制限（10-15フレーム）
- シェーダー簡略化（モバイル用）

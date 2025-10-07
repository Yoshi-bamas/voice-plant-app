import p5 from 'p5';
import { hslToRgb } from './utils';
import { createNoise2D } from 'simplex-noise';

// Simplexノイズ生成器（グローバル）
const noise2D = createNoise2D();

/**
 * 葉を描画する関数（ベジェ曲線で描画）
 * @param p - p5インスタンス
 * @param x - 葉の基点X座標
 * @param y - 葉の基点Y座標
 * @param size - 葉のサイズ
 * @param angle - 葉の角度（度数法）
 * @param r - 赤色値
 * @param g - 緑色値
 * @param b - 青色値
 */
function drawLeaf(p: p5, x: number, y: number, size: number, angle: number, r: number, g: number, b: number): void {
    p.push();
    p.translate(x, y);
    p.rotate(p.radians(angle));

    // 葉の色を設定
    p.fill(r, g, b);
    p.noStroke();

    // ベジェ曲線で葉の形を描画
    p.beginShape();
    p.vertex(0, 0); // 基点
    p.bezierVertex(
        size * 0.3, -size * 0.5,  // 制御点1
        size * 0.5, -size * 0.8,  // 制御点2
        size * 0.2, -size          // 終点（葉の先端）
    );
    p.bezierVertex(
        0, -size * 0.8,           // 制御点1
        0, -size * 0.5,           // 制御点2
        0, 0                      // 終点（基点に戻る）
    );
    p.endShape(p.CLOSE);

    p.pop();
}

/**
 * 茎を描画する関数（Simplexノイズで揺らぎ付き）
 * @param p - p5インスタンス
 * @param volume - 音量値（0-1）
 * @param frequency - 周波数平均値（0-1）
 */
export function drawStem(p: p5, volume: number, frequency: number): void {
    // 周波数(0-1)をhue(120-0)に変換（低い声→緑120°、高い声→赤0°）
    const hue = p.map(frequency, 0, 1, 120, 0);

    // HSLをRGBに変換（彩度100%、明度50%）
    const [r, g, b] = hslToRgb(hue, 1.0, 0.5);

    // 茎の色を設定（アナログに滑らかに変化）
    p.stroke(r, g, b);
    p.strokeWeight(8);

    // 画面下部中央(width/2, height*0.9)から垂直に線を描画
    const baseX = p.width / 2;
    const baseY = p.height * 0.9;

    // 音量(0-1)を茎の高さ(0-400px)に変換
    const stemHeight = p.map(volume, 0, 1, 0, 400);

    // Simplexノイズで茎の揺らぎを計算（時間ベース）
    const time = p.millis() / 1000; // 秒単位
    const noiseScale = 0.3; // ノイズの周波数
    const swayAmplitude = 15; // 揺れ幅（±15px）

    // ベジェ曲線で滑らかな茎を描画（揺らぎ付き）
    p.noFill();
    p.beginShape();
    p.vertex(baseX, baseY); // 基点

    // 茎を複数セグメントに分けて描画（10セグメント）
    const segments = 10;
    for (let i = 1; i <= segments; i++) {
        const ratio = i / segments;
        const y = baseY - stemHeight * ratio;

        // ノイズで横方向の揺れを計算（高さに応じて揺れ幅増加）
        const noiseValue = noise2D(time * noiseScale, ratio * 2);
        const swayX = baseX + noiseValue * swayAmplitude * ratio;

        p.vertex(swayX, y);
    }
    p.endShape();

    // 茎の先端の座標を計算（葉の描画用）
    const topNoiseValue = noise2D(time * noiseScale, 2);
    const topX = baseX + topNoiseValue * swayAmplitude;
    const topY = baseY - stemHeight;

    // 茎の中間地点に葉を1枚描画（揺らぎに追従）
    if (stemHeight > 50) {
        const leafRatio = 0.5; // 中間地点
        const leafNoiseValue = noise2D(time * noiseScale, leafRatio * 2);
        const leafX = baseX + leafNoiseValue * swayAmplitude * leafRatio;
        const leafY = baseY - stemHeight * leafRatio;
        const leafSize = 30;

        // 葉の角度をノイズで動的に変化（-45° ~ -15°）
        const leafAngle = -30 + noise2D(time * noiseScale * 0.5, 10) * 15;

        drawLeaf(p, leafX, leafY, leafSize, leafAngle, r, g, b);
    }
}

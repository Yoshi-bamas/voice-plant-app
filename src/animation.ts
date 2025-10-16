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
 * 茎を描画する関数（WebGL 3D版、Simplexノイズで揺らぎ付き）
 * v1.6: 3D円柱状の茎 + 球体の葉を複数配置
 * @param p - p5インスタンス
 * @param volume - 音量値（0-1）
 * @param frequency - 周波数平均値（0-1）
 */
export function drawStem(p: p5, volume: number, frequency: number): void {
    // 周波数(0-1)をhue(120-0)に変換（低い声→緑120°、高い声→赤0°）
    const hue = p.map(frequency, 0, 1, 120, 0);

    // HSLをRGBに変換（彩度100%、明度50%）
    const [r, g, b] = hslToRgb(hue, 1.0, 0.5);

    // 画面下部中央(width/2, height*0.9)から垂直に線を描画（2D座標系）
    const baseX = p.width / 2;
    const baseY = p.height * 0.9;

    // 音量(0-1)を茎の高さ(0-400px)に変換
    const stemHeight = p.map(volume, 0, 1, 0, 400);

    // Simplexノイズで茎の揺らぎを計算（時間ベース）
    const time = p.millis() / 1000; // 秒単位
    const noiseScale = 0.3; // ノイズの周波数
    const swayAmplitude = 15; // 揺れ幅（±15px）

    // 茎を複数セグメントに分けて3D円柱で描画（10セグメント）
    const segments = 10;
    for (let i = 0; i < segments; i++) {
        const ratio = i / segments;
        const nextRatio = (i + 1) / segments;

        // 現在のセグメントの位置
        const y1 = baseY - stemHeight * ratio;
        const noiseValue1 = noise2D(time * noiseScale, ratio * 2);
        const x1 = baseX + noiseValue1 * swayAmplitude * ratio;

        // 次のセグメントの位置
        const y2 = baseY - stemHeight * nextRatio;
        const noiseValue2 = noise2D(time * noiseScale, nextRatio * 2);
        const x2 = baseX + noiseValue2 * swayAmplitude * nextRatio;

        // セグメントの中点と長さを計算
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const segmentLength = p.dist(x1, y1, x2, y2);
        const angle = p.atan2(y2 - y1, x2 - x1);

        // 3D円柱を描画
        p.push();
        p.translate(midX, midY, 0);
        p.rotateZ(angle);
        p.rotateY(p.HALF_PI);  // 円柱を横向きに
        p.fill(r, g, b);
        p.noStroke();
        p.cylinder(4, segmentLength);  // 半径4px、長さ=セグメント長
        p.pop();
    }

    // 茎の高さに応じて葉を配置（50px毎に1枚、最大8枚）
    const leafInterval = 50;
    const maxLeaves = Math.floor(stemHeight / leafInterval);

    for (let i = 1; i <= maxLeaves; i++) {
        const leafRatio = i / (maxLeaves + 1);  // 0-1の範囲で均等配置
        const leafNoiseValue = noise2D(time * noiseScale, leafRatio * 2);
        const leafX = baseX + leafNoiseValue * swayAmplitude * leafRatio;
        const leafY = baseY - stemHeight * leafRatio;

        // 葉のサイズを成長度合いで変化（下の葉ほど大きい）
        const leafSize = 12 + (1 - leafRatio) * 8;  // 12-20px

        // 左右交互に葉を配置
        const side = i % 2 === 0 ? 1 : -1;
        const leafOffsetX = side * 20;

        // 3D球体で葉を描画
        p.push();
        p.translate(leafX + leafOffsetX, leafY, 0);

        // 葉の回転（ノイズで動的に変化）
        const leafRotation = noise2D(time * noiseScale * 0.5, i * 10) * 0.3;
        p.rotateZ(leafRotation);

        p.fill(r * 0.8, g * 1.1, b * 0.8);  // 葉は少し明るい緑
        p.noStroke();
        p.sphere(leafSize);
        p.pop();
    }

    // 茎の先端に花（Clear時に開花）
    if (stemHeight > 300) {
        const topNoiseValue = noise2D(time * noiseScale, 2);
        const topX = baseX + topNoiseValue * swayAmplitude;
        const topY = baseY - stemHeight;

        // 花びら（5枚の球体を放射状配置）
        const petalCount = 5;
        const petalRadius = 15;
        const flowerRadius = 20;

        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * p.TWO_PI;
            const petalX = topX + p.cos(angle + time) * flowerRadius;
            const petalY = topY + p.sin(angle + time) * flowerRadius;

            p.push();
            p.translate(petalX, petalY, 0);
            p.fill(255, 100 + i * 30, 150);  // ピンク〜赤のグラデーション
            p.noStroke();
            p.sphere(petalRadius);
            p.pop();
        }

        // 花の中心（黄色）
        p.push();
        p.translate(topX, topY, 0);
        p.fill(255, 215, 0);  // 金色
        p.noStroke();
        p.sphere(12);
        p.pop();
    }
}

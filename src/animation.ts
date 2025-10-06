import p5 from 'p5';
import { hslToRgb } from './utils';

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
 * 茎を描画する関数
 * @param p - p5インスタンス
 * @param volume - 音量値（0-1）
 * @param frequency - 周波数平均値（0-1）
 */
export function drawStem(p: p5, volume: number, frequency: number): void {
    // 周波数(0-1)をhue(120-0)に変換（低い声→緑120°、高い声→赤0°）
    // 注意: 低い声で120、高い声で0にするため、反転させる
    const hue = p.map(frequency, 0, 1, 120, 0);

    // HSLをRGBに変換（彩度100%、明度50%）
    const [r, g, b] = hslToRgb(hue, 1.0, 0.5);

    // 茎の色を設定（アナログに滑らかに変化）
    p.stroke(r, g, b);
    // 茎の太さを8pxに設定
    p.strokeWeight(8);

    // 画面下部中央(width/2, height*0.9)から垂直に線を描画
    const baseX = p.width / 2;
    const baseY = p.height * 0.9;

    // 音量(0-1)を茎の高さ(0-400px)に変換
    const stemHeight = p.map(volume, 0, 1, 0, 400);

    // 垂直に線を描画（下から上へ）
    p.line(baseX, baseY, baseX, baseY - stemHeight);

    // 茎の中間地点に葉を1枚描画
    if (stemHeight > 50) { // 茎がある程度伸びたら葉を表示
        const leafY = baseY - stemHeight / 2; // 中間地点
        const leafSize = 30; // 葉のサイズを30pxに固定
        const leafAngle = -30; // 左側に30度傾ける

        drawLeaf(p, baseX, leafY, leafSize, leafAngle, r, g, b);
    }
}

import p5 from 'p5';
import { hslToRgb } from './utils';

/**
 * 円形FFTビジュアライザーを描画
 * @param p - p5インスタンス
 * @param bands - 周波数バンドデータ（0-1の配列）
 */
export function drawCircularVisualizer(p: p5, bands: number[]): void {
    const centerX = p.width / 2;
    const centerY = p.height / 2;
    const baseRadius = 100;
    const maxBarLength = 200;
    const segments = bands.length;

    p.push();
    p.translate(centerX, centerY);

    for (let i = 0; i < segments; i++) {
        const angle = p.map(i, 0, segments, 0, p.TWO_PI);
        const amplitude = bands[i];
        const barLength = p.map(amplitude, 0, 1, 0, maxBarLength);

        // 色を計算: 低音域→青(240°), 中音域→緑(120°), 高音域→赤(0°)
        const hue = p.map(i, 0, segments, 240, 0);
        const [r, g, b] = hslToRgb(hue, 1, 0.5);

        // バーの開始点と終了点を計算
        const x1 = Math.cos(angle) * baseRadius;
        const y1 = Math.sin(angle) * baseRadius;
        const x2 = Math.cos(angle) * (baseRadius + barLength);
        const y2 = Math.sin(angle) * (baseRadius + barLength);

        // バーを描画
        p.stroke(r, g, b);
        p.strokeWeight(4);
        p.line(x1, y1, x2, y2);
    }

    p.pop();
}

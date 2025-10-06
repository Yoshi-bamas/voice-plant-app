/**
 * HSLをRGBに変換する関数
 * @param h - 色相（0-360）
 * @param s - 彩度（0-1）
 * @param l - 明度（0-1）
 * @returns RGB値の配列 [r, g, b] (0-255)
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    // 色相を0-1の範囲に正規化
    h = h / 360;

    let r: number, g: number, b: number;

    if (s === 0) {
        // 彩度が0の場合はグレースケール
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number): number => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    // 0-255の範囲に変換
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * 周波数バンドを対数スケールで指定数に分割・平均化する関数
 * 低音偏重を防ぎ、全音域をバランスよく表示
 * @param bands - 全周波数バンドデータ（0-1の配列）
 * @param segments - 分割数（デフォルト: 16）
 * @returns 平均化されたバンドデータ（0-1の配列）
 */
export function averageFrequencyBands(bands: number[], segments: number = 16): number[] {
    if (bands.length === 0) {
        return new Array(segments).fill(0);
    }

    const result: number[] = [];

    // 人間の声の範囲を広めに（0-6000Hz程度、約256ビン）
    // FFTSize=2048, サンプリングレート=48000Hzの場合
    const usefulBandCount = Math.min(Math.floor(bands.length / 4), bands.length);
    const maxIndex = usefulBandCount - 1;

    const threshold = 0.15; // 閾値（15%未満は無視）
    const highBoost = 1.6; // 高音域ブースト係数

    for (let i = 0; i < segments; i++) {
        // 対数スケールでインデックスを計算
        const startRatio = Math.pow(i / segments, 1.8);
        const endRatio = Math.pow((i + 1) / segments, 1.8);

        const start = Math.floor(startRatio * maxIndex);
        const end = Math.floor(endRatio * maxIndex);

        let sum = 0;
        let count = 0;
        for (let j = start; j <= end && j < usefulBandCount; j++) {
            sum += bands[j];
            count++;
        }

        let average = count > 0 ? sum / count : 0;

        // 閾値処理
        if (average < threshold) {
            average = 0;
        } else {
            // 閾値以上の値を0-1に再マッピング
            average = (average - threshold) / (1 - threshold);
        }

        // 非線形マッピング（緩やかに上昇）
        average = Math.pow(average, 1.5);

        // 高音域（後半のセグメント）をブースト
        const boostedValue = i > segments * 0.4
            ? Math.min(1, average * highBoost)
            : average;

        result.push(boostedValue);
    }

    return result;
}

/**
 * Easy Mode用: 音量パラメータを増幅
 * @param volume - 元の音量（0-1）
 * @param amplification - 増幅率（デフォルト: 3.0）
 * @returns 増幅された音量（0-1にクランプ）
 */
export function amplifyVolume(volume: number, amplification: number = 3.0): number {
    return Math.min(1, volume * amplification);
}

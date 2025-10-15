/**
 * GrowthSystem.ts (v1.4新規追加)
 * MAX-based持続型成長システム
 *
 * 従来: 瞬間音量で高さ決定 → 音量が下がると植物も縮む
 * v1.4: MAX音量到達後、その音量を維持している間は少しずつ成長
 */

export class GrowthSystem {
    private maxVolume: number = 0;           // 観測された最大音量
    private sustainedFrames: number = 0;     // MAX音量を維持しているフレーム数
    private currentHeight: number = 0;       // 現在の植物の高さ（0-400px）
    private readonly growthRate: number = 2.0;  // 1フレームあたりの成長量（px）
    private readonly maxHeight: number = 400;   // 植物の最大高さ（px）
    private readonly sustainThreshold: number = 0.95; // MAX音量の何%で「維持」とみなすか

    /**
     * フレームごとの更新処理
     * @param volume - 現在の音量（0-1）
     */
    update(volume: number): void {
        // v1.5.7修正: 最小音量閾値を追加（ノイズを除外）
        const MIN_VOLUME_THRESHOLD = 0.15;  // 15%以下の音量は無視

        // MAX音量を更新（ただし、最小閾値以上の場合のみ）
        if (volume > this.maxVolume && volume >= MIN_VOLUME_THRESHOLD) {
            this.maxVolume = volume;
        }

        // v1.5.7修正: 絶対閾値と相対閾値の両方をチェック
        const isAboveMinThreshold = volume >= MIN_VOLUME_THRESHOLD;
        const isAtMax = volume >= this.maxVolume * this.sustainThreshold;

        // 両方の条件を満たす場合のみ成長
        if (isAtMax && isAboveMinThreshold && this.maxVolume > MIN_VOLUME_THRESHOLD) {
            this.sustainedFrames++;
            this.currentHeight += this.growthRate;

            // 最大高さを超えないようにクランプ
            this.currentHeight = Math.min(this.currentHeight, this.maxHeight);
        } else {
            // MAX未達の場合、sustainedFramesをリセット（連続性を要求）
            this.sustainedFrames = 0;
        }
    }

    /**
     * 現在の植物の高さを取得
     * @returns 高さ（0-400px）
     */
    getCurrentHeight(): number {
        return this.currentHeight;
    }

    /**
     * v1.5.5: 現在の植物の高さを設定（リセットアニメーション用）
     * @param height - 設定する高さ（0-400px）
     */
    setCurrentHeight(height: number): void {
        this.currentHeight = Math.max(0, Math.min(this.maxHeight, height));
    }

    /**
     * 観測されたMAX音量を取得
     * @returns MAX音量（0-1）
     */
    getMaxVolume(): number {
        return this.maxVolume;
    }

    /**
     * MAX音量を維持しているフレーム数を取得
     * @returns フレーム数
     */
    getSustainedFrames(): number {
        return this.sustainedFrames;
    }

    /**
     * 成長率を取得
     * @returns 1フレームあたりの成長量（px）
     */
    getGrowthRate(): number {
        return this.growthRate;
    }

    /**
     * 最大高さに到達しているかチェック
     * @returns 最大高さ到達済みならtrue
     */
    hasReachedMax(): boolean {
        return this.currentHeight >= this.maxHeight;
    }

    /**
     * システムをリセット（ゲーム再スタート時）
     */
    reset(): void {
        this.maxVolume = 0;
        this.sustainedFrames = 0;
        this.currentHeight = 0;
    }
}

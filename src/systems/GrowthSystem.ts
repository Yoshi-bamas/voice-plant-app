/**
 * GrowthSystem.ts (v1.4新規追加)
 * v1.5.7改: 持続時間ベース成長システム
 *
 * 従来: MAX音量到達後、その音量を維持している間は少しずつ成長
 * v1.5.7: 閾値以上の音量を維持している「累積時間」で成長（音量の大小は影響小）
 */

export class GrowthSystem {
    private maxVolume: number = 0;           // 観測された最大音量（記録用）
    private sustainedFrames: number = 0;     // 閾値以上を維持しているフレーム数
    private currentHeight: number = 0;       // 現在の植物の高さ（0-400px）
    private readonly growthRate: number = 0.8;  // v1.5.7: 1フレームあたりの成長量（400px到達まで約8秒）
    private readonly maxHeight: number = 400;   // 植物の最大高さ（px）
    private readonly volumeThreshold: number = 0.08; // v1.5.7: 成長開始閾値（VoiceContinuityと同じ）

    /**
     * フレームごとの更新処理
     * v1.5.7改: 持続時間ベース成長
     * @param volume - 現在の音量（0-1）
     */
    update(volume: number): void {
        // v1.5.7: 最大音量記録（デバッグ用、成長ロジックには影響しない）
        if (volume > this.maxVolume) {
            this.maxVolume = volume;
        }

        // v1.5.7: 閾値以上の音量を「維持している時間」で成長
        if (volume >= this.volumeThreshold) {
            // 閾値以上 → 成長継続
            this.sustainedFrames++;
            this.currentHeight += this.growthRate;

            // 最大高さを超えないようにクランプ
            this.currentHeight = Math.min(this.currentHeight, this.maxHeight);
        } else {
            // 閾値未満 → 成長停止（高さは維持、リセットしない）
            // sustainedFramesはリセットしない（累積時間を記録）
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

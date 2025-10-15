/**
 * GameFlowController.ts (v1.4新規追加)
 * ゲームフロー制御システム
 *
 * 音量閾値検出:
 * 1. 音量がthresholdを超えた後、thresholdを下回る
 * 2. 60フレーム連続で下回ったままならゲーム終了
 * 3. ゴール到達済みならClear、未達ならGameOver
 */

export class GameFlowController {
    private volumeThreshold: number = 0.05;     // 音量終了閾値（5%）
    private maxVolume: number = 0;              // 観測されたMAX音量
    private belowThresholdFrames: number = 0;   // 閾値以下のフレーム数
    private readonly endThresholdFrames: number = 60; // 終了判定フレーム数（60fps = 1秒）
    private hasExceededThreshold: boolean = false; // 一度でも閾値を超えたか
    private goalReached: boolean = false;       // ゴール到達フラグ

    /**
     * フレームごとの更新処理
     * @param volume - 現在の音量（0-1）
     */
    update(volume: number): void {
        // MAX音量を更新
        if (volume > this.maxVolume) {
            this.maxVolume = volume;
        }

        // 閾値を一度でも超えたかチェック
        if (volume > this.volumeThreshold) {
            this.hasExceededThreshold = true;
            this.belowThresholdFrames = 0; // 閾値以上なのでリセット
        } else if (this.hasExceededThreshold) {
            // 閾値を超えた後、下回った場合のみカウント
            this.belowThresholdFrames++;
        }
    }

    /**
     * ゲーム終了判定
     * @returns 終了すべきならtrue
     */
    shouldEndGame(): boolean {
        return this.hasExceededThreshold &&
               this.belowThresholdFrames >= this.endThresholdFrames;
    }

    /**
     * ゴール到達フラグを設定
     * @param reached - ゴール到達したならtrue
     */
    setGoalReached(reached: boolean): void {
        this.goalReached = reached;
    }

    /**
     * ゴール到達済みかチェック
     * @returns ゴール到達済みならtrue
     */
    hasReachedGoal(): boolean {
        return this.goalReached;
    }

    /**
     * 観測されたMAX音量を取得
     * @returns MAX音量（0-1）
     */
    getMaxVolume(): number {
        return this.maxVolume;
    }

    /**
     * 閾値以下のフレーム数を取得
     * @returns フレーム数
     */
    getBelowThresholdFrames(): number {
        return this.belowThresholdFrames;
    }

    /**
     * 音量閾値を設定
     * @param threshold - 新しい閾値（0-1）
     */
    setVolumeThreshold(threshold: number): void {
        this.volumeThreshold = Math.max(0, Math.min(1, threshold));
    }

    /**
     * 音量閾値を取得
     * @returns 現在の閾値（0-1）
     */
    getVolumeThreshold(): number {
        return this.volumeThreshold;
    }

    /**
     * 一度でも閾値を超えたかチェック
     * @returns 超えたことがあればtrue
     */
    hasStarted(): boolean {
        return this.hasExceededThreshold;
    }

    /**
     * システムをリセット（ゲーム再スタート時）
     */
    reset(): void {
        this.maxVolume = 0;
        this.belowThresholdFrames = 0;
        this.hasExceededThreshold = false;
        this.goalReached = false;
    }
}

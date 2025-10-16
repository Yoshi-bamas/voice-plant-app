/**
 * VoiceContinuityDetector.ts
 * v1.4.5新規追加: 声途切れ検出システム
 *
 * 【役割】
 * - 音量が閾値以下の連続フレーム数をカウント
 * - 一定フレーム以上途切れたらGameOver判定
 * - 声が途切れたら植物を即座に0リセット
 */

/**
 * 声の連続性を監視するクラス
 * 音量が一定フレーム以上閾値以下の場合、声途切れと判定
 */
export class VoiceContinuityDetector {
    private volumeThreshold: number;
    private silentFrames: number;
    private maxSilentFrames: number;
    private graceFrames: number;              // v1.5.5: 無敵時間フレーム数
    private elapsedFrames: number;            // v1.5.5: 経過フレーム数
    private hasVoiceStarted: boolean;         // v1.5.5: 発声開始フラグ

    /**
     * コンストラクタ
     * @param volumeThreshold - 音量閾値（デフォルト0.05、範囲0.005-0.15）
     * @param maxSilentFrames - 途切れ判定フレーム数（デフォルト90フレーム = 1.5秒@60fps）
     * @param graceSeconds - 無敵時間（秒、デフォルト3秒）
     */
    constructor(volumeThreshold: number = 0.05, maxSilentFrames: number = 90, graceSeconds: number = 3) {
        this.volumeThreshold = volumeThreshold;
        this.silentFrames = 0;
        this.maxSilentFrames = maxSilentFrames;
        this.graceFrames = graceSeconds * 60;  // 秒→フレーム変換（60fps）
        this.elapsedFrames = 0;
        this.hasVoiceStarted = false;
    }

    /**
     * 音量を更新
     * @param volume - 現在の音量（0-1の範囲）
     */
    update(volume: number): void {
        // v1.5.5: 経過時間カウント
        this.elapsedFrames++;

        // v1.5.5: 発声開始検出
        if (volume >= this.volumeThreshold) {
            this.hasVoiceStarted = true;
            this.silentFrames = 0;  // 閾値以上なのでリセット
        } else {
            // 閾値以下: 無音フレームカウント増加
            this.silentFrames++;
        }
    }

    /**
     * 声が途切れたかを判定
     * @returns true: 途切れた（GameOver）, false: 継続中
     */
    isVoiceLost(): boolean {
        // v1.5.5: 無敵時間中、または発声開始前は途切れ判定しない
        if (this.elapsedFrames < this.graceFrames || !this.hasVoiceStarted) {
            return false;
        }
        return this.silentFrames >= this.maxSilentFrames;
    }

    /**
     * 検出器をリセット
     * ゲーム開始時や再スタート時に呼び出す
     */
    reset(): void {
        this.silentFrames = 0;
        this.elapsedFrames = 0;
        this.hasVoiceStarted = false;
    }

    /**
     * v1.5.5: 発声開始済みかチェック
     * @returns true: 発声開始済み, false: 未開始
     */
    hasStartedVoice(): boolean {
        return this.hasVoiceStarted;
    }

    /**
     * v1.5.5: 無敵時間中かチェック
     * @returns true: 無敵時間中, false: 通常状態
     */
    isInGracePeriod(): boolean {
        return this.elapsedFrames < this.graceFrames;
    }

    /**
     * 現在の無音フレーム数を取得（デバッグ用）
     * @returns 無音フレーム数
     */
    getSilentFrames(): number {
        return this.silentFrames;
    }

    /**
     * 音量閾値を設定
     * @param threshold - 新しい閾値（0-1の範囲）
     */
    setVolumeThreshold(threshold: number): void {
        this.volumeThreshold = Math.max(0, Math.min(1, threshold));
    }

    /**
     * 最大無音フレーム数を設定
     * @param frames - 新しい最大フレーム数
     */
    setMaxSilentFrames(frames: number): void {
        this.maxSilentFrames = Math.max(1, frames);
    }
}

import p5 from 'p5';
import { AudioAnalyzer } from './audio';
import { IView, PlantState } from './types';
import { drawStem } from './animation';
import { ParticleSystem } from './effects/ParticleSystem';
import { ConcreteEffect } from './effects/ConcreteEffect';

/**
 * 植物ビュークラス（v1.0状態管理版）
 * v1.5.7改: 持続時間ベース成長システム統合
 * 音量で茎が伸び、周波数で葉が分岐する植物を描画
 * Clear!エフェクト（粒子・コンクリート）統合
 * v1.0: Clear後は完成状態を維持、継続エフェクト表示
 */
export class PlantView implements IView {
    private volume: number = 0;
    private frequency: number = 0;
    private smoothedVolume: number = 0;
    private readonly smoothingFactor: number = 0.3;

    // v1.5.7: 持続時間ベース成長
    private accumulatedHeight: number = 0;  // 累積成長高さ（0-400px）
    private readonly growthRate: number = 0.8;  // 1フレームあたりの成長量（400px到達まで約8秒）
    private volumeThreshold: number = 0.008;  // v1.5.7: 成長開始閾値（デフォルト0.008、対数スケール0.001-0.20）

    // v1.0: 状態管理
    private plantState: PlantState = 'growing';
    private clearedHeight: number = 0;  // Clear時の高さを保存
    protected clearThreshold: number = 0.8;  // Clearライン目標値（スライダーで変更可）

    // Clear!エフェクト
    private particles: ParticleSystem;
    private concrete: ConcreteEffect;
    private clearTriggered: boolean = false;

    constructor() {
        this.particles = new ParticleSystem();
        this.concrete = new ConcreteEffect();
    }

    update(audioAnalyzer: AudioAnalyzer): void {
        this.volume = audioAnalyzer.getVolume();
        const frequencyData = audioAnalyzer.getFrequency();
        this.frequency = frequencyData.average;

        // 音量をスムージング（表示用、揺れ演出で使用）
        this.smoothedVolume = this.smoothedVolume * (1 - this.smoothingFactor) + this.volume * this.smoothingFactor;

        // v1.5.7: 持続時間ベース成長処理
        if (this.plantState === 'growing') {
            // 閾値以上の音量を維持している時間で成長
            if (this.volume >= this.volumeThreshold) {
                this.accumulatedHeight += this.growthRate;
                // 最大高さ400pxでクランプ
                this.accumulatedHeight = Math.min(this.accumulatedHeight, 400);
            }
            // 閾値未満の場合は成長停止（高さは維持）

            // v1.5.7: Clear!判定（update内で実行、draw内での判定を廃止）
            if (this.accumulatedHeight >= this.clearThreshold * 400 && !this.clearTriggered) {
                console.log(`[PlantView] Clear threshold reached! Height: ${this.accumulatedHeight}, Threshold: ${this.clearThreshold * 400}`);
                this.transitionToCleared();
            }

            // Clear!リトライ判定（高さが下がったら再挑戦可能）
            if (this.accumulatedHeight < this.clearThreshold * 400 * 0.7 && this.clearTriggered) {
                this.clearTriggered = false;
            }
        } else {
            // cleared状態: 高さ固定、継続エフェクトのみ
            this.updateClearedEffects();
        }

        // エフェクト更新（共通）
        this.particles.update();
        this.concrete.update();
    }

    /**
     * v1.0改: Clear後の継続エフェクト更新
     */
    private updateClearedEffects(): void {
        // 花びら降下（画面上部から常時、30粒子上限）
        this.particles.generateFloatingPetals(800, 30);  // Canvas幅800px想定

        // キラキラエフェクト（ランダム位置、15粒子上限）
        this.particles.generateSparkles(800, 600, 15);  // Canvas 800x600想定
    }

    /**
     * v1.0: cleared状態への遷移
     * v1.5.7: accumulatedHeightベースに変更
     */
    private transitionToCleared(): void {
        console.log('[PlantView] Transitioning to CLEARED state');
        this.plantState = 'cleared';
        this.clearedHeight = this.accumulatedHeight;  // 累積高さを保存
        this.clearTriggered = true;
        this.triggerClear(this.calculateWallY(), this.calculateImpactX());
        console.log(`[PlantView] State now: ${this.plantState}`);
    }

    /**
     * v1.0: 壁のY座標を計算（ヘルパーメソッド）
     */
    private calculateWallY(): number {
        const baseY = this.getBaseY();
        return baseY - (this.clearThreshold * 400);
    }

    /**
     * v1.0: 衝突X座標を計算（ヘルパーメソッド）
     */
    private calculateImpactX(): number {
        return 400;  // 画面中央（仮、p5インスタンスがないため固定値）
    }

    /**
     * v1.0: 基点Y座標を取得
     */
    private getBaseY(): number {
        return 540;  // height * 0.9（仮、p5インスタンスがないため固定値）
    }

    /**
     * v1.0: Clearライン目標値を設定（スライダー連携）
     */
    setClearThreshold(threshold: number): void {
        this.clearThreshold = Math.max(0.5, Math.min(1.0, threshold));
    }

    /**
     * v1.5.7: マイク感度（音量閾値）を設定（スライダー連携）
     * 対数スケール: 0.001-0.20
     */
    setVolumeThreshold(threshold: number): void {
        this.volumeThreshold = Math.max(0.001, Math.min(0.20, threshold));
    }

    /**
     * Clear!エフェクトをトリガー
     * @param wallY - 壁のY座標
     * @param impactX - 衝突X座標（画面中央）
     */
    private triggerClear(wallY: number, impactX: number): void {
        this.clearTriggered = true;

        // DOM操作: "Clear!"メッセージ表示
        this.showClearMessage();

        // 粒子発射（壁の位置から）
        this.particles.burst(impactX, wallY, 100);

        // コンクリートひび割れ（壁の位置、衝突X座標を渡す）
        this.concrete.crack(wallY, impactX / 800);  // 画面幅比率に変換（仮に800px想定）
    }

    /**
     * v1.0改: Clear!メッセージを常時表示（cleared状態の間）
     */
    private showClearMessage(): void {
        const msg = document.getElementById('clearMessage');
        if (msg) {
            msg.classList.add('clear-message--visible');
            msg.classList.add('clear-message--persistent');  // 常時表示クラス追加
        }
    }

    draw(p: p5): void {
        // v1.1.1: Clear!ライン（壁）の位置を計算（clearThresholdに連動）
        const baseY = p.height * 0.9;
        const clearLineY = baseY - (this.clearThreshold * 400);
        const wallY = clearLineY;

        // コンクリート壁を描画（赤ライン位置に横向き）
        this.concrete.drawWall(p, wallY, 60, [120, 120, 120], 0.9);

        // v1.5.7: Clear!判定はupdate()で実行（draw()内での判定を廃止）

        // v1.5.7: 茎を描画（accumulatedHeightベース、cleared状態では固定高さ使用）
        const displayHeight = this.plantState === 'cleared' ? this.clearedHeight : this.accumulatedHeight;
        const displayVolume = displayHeight / 400;  // 0-1の範囲に正規化
        drawStem(p, displayVolume, this.frequency);

        // コンクリートひび割れを描画
        this.concrete.drawCracks(p);

        // 粒子を描画
        this.particles.draw(p);
    }

    /**
     * Challenge Mode用: 植物の高さを0にリセット
     * v1.5.7: accumulatedHeightもリセット
     * ChallengeModeViewから呼び出される
     */
    resetPlantHeight(): void {
        // cleared状態を保護
        if (this.plantState !== 'cleared') {
            this.smoothedVolume = 0;
            this.accumulatedHeight = 0;  // v1.5.7: 累積高さもリセット
            this.particles.clear();
            this.concrete = new ConcreteEffect();
        }
    }

    /**
     * Challenge Mode用: GameOver状態への遷移
     * v1.5.7: cleared状態を保護
     * ChallengeModeViewから呼び出される
     */
    transitionToGameOver(): void {
        // cleared状態の場合はGameOverに遷移しない（成功状態を保護）
        if (this.plantState === 'cleared') {
            console.log('[PlantView] Already cleared, ignoring GameOver transition');
            return;
        }

        console.log('[PlantView] Transitioning to GameOver');
        this.plantState = 'gameOver';
    }

    /**
     * Challenge Mode用: リセット完了チェック
     * v1.0版ではアニメーションなしのため常にtrue
     */
    isResetComplete(): boolean {
        return true;
    }

    /**
     * Challenge Mode用: 植物の状態を取得
     */
    getPlantState(): PlantState {
        return this.plantState;
    }

    /**
     * Challenge Mode用: リセット処理
     * v1.5.7: accumulatedHeightもリセット
     */
    reset(): void {
        this.plantState = 'growing';
        this.volume = 0;
        this.frequency = 0;
        this.smoothedVolume = 0;
        this.accumulatedHeight = 0;  // v1.5.7: 累積高さもリセット
        this.clearedHeight = 0;
        this.clearTriggered = false;

        // エフェクトをクリア
        this.particles = new ParticleSystem();
        this.concrete = new ConcreteEffect();
    }

    /**
     * Challenge Mode用: 残り時間取得（v1.0版ではタイマーなし）
     */
    getRemainingTime(): number | null {
        return null;
    }

    /**
     * Challenge Mode用: プレビューモード用の高さ設定
     */
    setPreviewHeight(volume: number): void {
        // EasyMode相当の増幅（×2.5）
        const amplifiedVolume = Math.min(volume * 2.5, 1.0);
        this.smoothedVolume = this.smoothedVolume * (1 - this.smoothingFactor) + amplifiedVolume * this.smoothingFactor;
    }
}

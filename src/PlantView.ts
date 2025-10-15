import p5 from 'p5';
import { AudioAnalyzer } from './audio';
import { IView, PlantState } from './types';
import { drawStem } from './animation';
import { ParticleSystem } from './effects/ParticleSystem';
import { ConcreteEffect } from './effects/ConcreteEffect';

/**
 * 植物ビュークラス（v1.0状態管理版）
 * 音量で茎が伸び、周波数で葉が分岐する植物を描画
 * Clear!エフェクト（粒子・コンクリート）統合
 * v1.0: Clear後は完成状態を維持、継続エフェクト表示
 */
export class PlantView implements IView {
    private volume: number = 0;
    private frequency: number = 0;
    private smoothedVolume: number = 0;
    private readonly smoothingFactor: number = 0.3;

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

        // 音量をスムージング
        this.smoothedVolume = this.smoothedVolume * (1 - this.smoothingFactor) + this.volume * this.smoothingFactor;

        // v1.0: 状態別の処理
        if (this.plantState === 'growing') {
            // growing状態: 通常の成長処理
            // Clear!判定はdraw()で実行（壁の位置計算後）

            // Clear!リトライ判定（音量が下がったら再挑戦可能）
            if (this.smoothedVolume < 0.3 && this.clearTriggered) {
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
     */
    private transitionToCleared(): void {
        this.plantState = 'cleared';
        this.clearedHeight = this.smoothedVolume * 400;  // 現在の高さを保存
        this.clearTriggered = true;
        this.triggerClear(this.calculateWallY(), this.calculateImpactX());
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

        // v1.0: Clear!判定（clearThreshold以上、壁の位置を渡す）
        if (this.smoothedVolume > this.clearThreshold && !this.clearTriggered && this.plantState === 'growing') {
            this.transitionToCleared();
        }

        // 茎を描画（v1.0: cleared状態では固定高さ使用）
        const displayVolume = this.plantState === 'cleared' ? this.clearedHeight / 400 : this.smoothedVolume;
        drawStem(p, displayVolume, this.frequency);

        // コンクリートひび割れを描画
        this.concrete.drawCracks(p);

        // 粒子を描画
        this.particles.draw(p);
    }

    /**
     * Challenge Mode用: 植物の高さを0にリセット
     * ChallengeModeViewから呼び出される
     */
    resetPlantHeight(): void {
        // v1.0版では単純に音量をリセット（cleared状態を保護）
        if (this.plantState !== 'cleared') {
            this.smoothedVolume = 0;
            this.particles.clear();
            this.concrete = new ConcreteEffect();
        }
    }

    /**
     * Challenge Mode用: GameOver状態への遷移
     * ChallengeModeViewから呼び出される
     */
    transitionToGameOver(): void {
        // cleared状態の場合はGameOverに遷移しない（成功状態を保護）
        if (this.plantState === 'cleared') {
            return;
        }

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
     */
    reset(): void {
        this.plantState = 'growing';
        this.volume = 0;
        this.frequency = 0;
        this.smoothedVolume = 0;
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

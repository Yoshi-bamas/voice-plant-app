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

    // v1.6改: 2フェーズ成長システム（初動期間 + 継続成長）
    private accumulatedHeight: number = 0;  // 累積成長高さ（0-400px）
    private volumeThreshold: number = 0.05;  // v1.6: 成長開始閾値（デフォルト0.05、範囲0.005-0.15）

    // v1.6改: フェーズ管理
    private readonly initialPhaseDuration: number = 1.5;  // 初動期間（秒）
    private elapsedTime: number = 0;  // 経過時間（秒）
    private baselineHeight: number = 0;  // 初動期間での最大到達高さ（ベースライン）
    private sustainedGrowthAccumulated: number = 0;  // 継続成長の積み上げ

    // v1.6改: 初動期間の音量→高さ変換係数
    private readonly initialPhaseMultiplier: number = 3500;  // volume × 3500 = 最大350px（volume=0.10時）

    // v1.6改: 10段階閾値設定（継続成長重視）
    private readonly volumeThresholds = [
        { threshold: 0.005, sustainedGrowth: 0.20 },   // Lv1: 最小限の声（基礎成長）
        { threshold: 0.015, sustainedGrowth: 0.30 },   // Lv2: 少し大きく
        { threshold: 0.025, sustainedGrowth: 0.40 },   // Lv3: 普通の声
        { threshold: 0.040, sustainedGrowth: 0.50 },   // Lv4: やや大きい
        { threshold: 0.060, sustainedGrowth: 0.60 },   // Lv5: 大きい
        { threshold: 0.080, sustainedGrowth: 0.70 },   // Lv6: かなり大きい
        { threshold: 0.100, sustainedGrowth: 0.85 },   // Lv7: 非常に大きい
        { threshold: 0.120, sustainedGrowth: 1.00 },   // Lv8: 超大声
        { threshold: 0.140, sustainedGrowth: 1.10 },   // Lv9: ほぼMAX
        { threshold: 0.160, sustainedGrowth: 1.20 },   // Lv10: MAX（ボーナス）
    ];

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

        // v1.6改: 2フェーズ成長システム
        if (this.plantState === 'growing') {
            // 経過時間を更新（60fps想定）
            this.elapsedTime += 1 / 60;

            // フェーズ1: 初動期間（0-1.5秒）
            if (this.elapsedTime <= this.initialPhaseDuration) {
                // 音量に純粋に比例した高さ（リアルタイム変動）
                if (this.volume >= this.volumeThreshold) {
                    const currentHeight = this.volume * this.initialPhaseMultiplier;
                    this.accumulatedHeight = Math.min(currentHeight, 400);

                    // ベースライン更新（この期間の最大値を記録）
                    if (this.accumulatedHeight > this.baselineHeight) {
                        this.baselineHeight = this.accumulatedHeight;
                    }
                } else {
                    // 閾値未満の場合、前フレームの高さを維持
                    this.accumulatedHeight = this.baselineHeight;
                }
            }
            // フェーズ2: 継続成長期間（1.5秒以降）
            else {
                // ベースライン（初動での最大到達高さ）+ 継続成長の積み上げ
                if (this.volume >= this.volumeThreshold) {
                    // 現在の音量に応じたレベルを判定（10段階）
                    let sustainedGrowth = 0;
                    for (let i = this.volumeThresholds.length - 1; i >= 0; i--) {
                        if (this.volume >= this.volumeThresholds[i].threshold) {
                            sustainedGrowth = this.volumeThresholds[i].sustainedGrowth;
                            break;
                        }
                    }

                    // 継続成長を積み上げ
                    this.sustainedGrowthAccumulated += sustainedGrowth;
                }

                // 合計高さ = ベースライン + 継続成長
                this.accumulatedHeight = this.baselineHeight + this.sustainedGrowthAccumulated;

                // 最大高さ400pxでクランプ
                this.accumulatedHeight = Math.min(this.accumulatedHeight, 400);
            }

            // Clear!判定
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
     * v1.6改: 2フェーズシステムの変数もリセット
     * ChallengeModeViewから呼び出される
     */
    resetPlantHeight(): void {
        // cleared状態を保護
        if (this.plantState !== 'cleared') {
            this.smoothedVolume = 0;
            this.accumulatedHeight = 0;

            // v1.6改: 2フェーズシステム変数リセット
            this.elapsedTime = 0;
            this.baselineHeight = 0;
            this.sustainedGrowthAccumulated = 0;

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
     * v1.6改: 2フェーズシステムの変数もリセット
     */
    reset(): void {
        this.plantState = 'growing';
        this.volume = 0;
        this.frequency = 0;
        this.smoothedVolume = 0;
        this.accumulatedHeight = 0;
        this.clearedHeight = 0;
        this.clearTriggered = false;

        // v1.6改: 2フェーズシステム変数リセット
        this.elapsedTime = 0;
        this.baselineHeight = 0;
        this.sustainedGrowthAccumulated = 0;

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

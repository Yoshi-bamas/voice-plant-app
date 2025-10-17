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

    // v1.7.1: 2フェーズ成長システム（初期音量サンプリング + 段階的延長成長）
    private accumulatedHeight: number = 0;  // 累積成長高さ（0-400px）
    private volumeThreshold: number = 0.05;  // 成長開始閾値（デフォルト0.05）

    // v1.7.1: フェーズ管理（初期期間を0.8秒に短縮）
    private readonly initialPhaseDuration: number = 0.8;  // 初期成長期間（秒）
    private readonly quickGrowthDuration: number = 0.3;  // 大声検知時の急成長期間（秒）
    private readonly quickGrowthThreshold: number = 0.15; // 大声判定閾値
    private readonly quickGrowthTarget: number = 260;     // 大声時の0.3秒到達目標（65% = 260px）

    private elapsedTime: number = 0;  // 経過時間（秒）
    private volumeSamples: number[] = [];  // 初期0.8秒間の音量サンプル
    private targetHeight: number = 0;  // 目標高さ（70-90%の範囲）
    private isQuickGrowth: boolean = false;  // 大声検知フラグ
    private maxAllowedLevel: number = 5;  // Phase 2で使える最大レベル（初期音量で決定）
    private hasVoiceStarted: boolean = false;  // v1.7.3: 発声開始フラグ

    // v1.7.2: 段階的延長成長設定（px/秒、3倍速・10段階評価）
    private readonly sustainedGrowthLevels = [
        { threshold: 0.05, growthRate: 24 },   // Lv1: 最弱（24px/秒）
        { threshold: 0.08, growthRate: 30 },   // Lv2: 弱い（30px/秒）
        { threshold: 0.10, growthRate: 36 },   // Lv3: やや弱い（36px/秒）
        { threshold: 0.12, growthRate: 42 },   // Lv4: 普通の下（42px/秒）
        { threshold: 0.14, growthRate: 48 },   // Lv5: 普通（48px/秒）
        { threshold: 0.16, growthRate: 54 },   // Lv6: やや大きい（54px/秒）
        { threshold: 0.18, growthRate: 60 },   // Lv7: 大きい（60px/秒）
        { threshold: 0.20, growthRate: 70 },   // Lv8: かなり大きい（70px/秒）
        { threshold: 0.23, growthRate: 80 },   // Lv9: 超大声（80px/秒）
        { threshold: 0.26, growthRate: 90 },   // Lv10: MAX（90px/秒）
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

        // v1.7.1: 2フェーズ成長システム（初期サンプリング + 段階的延長）
        if (this.plantState === 'growing') {
            // v1.7.3: 発声検知後のみ経過時間をカウント
            if (!this.hasVoiceStarted && this.volume >= this.volumeThreshold) {
                this.hasVoiceStarted = true;
                console.log('[PlantView] Voice detected, starting growth');
            }

            // 発声開始後のみ経過時間を更新（60fps想定）
            if (this.hasVoiceStarted) {
                this.elapsedTime += 1 / 60;
            }

            // Phase 1: 初期成長（0-0.8秒）- 音量サンプリング + イージング成長
            if (this.elapsedTime <= this.initialPhaseDuration) {
                // 音量をサンプリング
                this.volumeSamples.push(this.volume);

                // 平均音量を計算
                const avgVolume = this.volumeSamples.reduce((a, b) => a + b, 0) / this.volumeSamples.length;

                // 目標高さ = 65% + (初期平均音量 * 15%) = 260-320px (65-80%)
                this.targetHeight = (0.65 + avgVolume * 0.15) * 400;

                // 大声検知（平均音量が閾値以上）
                if (avgVolume >= this.quickGrowthThreshold && !this.isQuickGrowth) {
                    this.isQuickGrowth = true;
                }

                // 成長ロジック
                if (this.isQuickGrowth) {
                    // 大声モード: 0.3秒で70%まで急成長 → 残り0.5秒で目標高さまでイージング
                    if (this.elapsedTime <= this.quickGrowthDuration) {
                        // 0-0.3秒: 70%まで急成長
                        const quickProgress = this.elapsedTime / this.quickGrowthDuration;
                        this.accumulatedHeight = this.quickGrowthTarget * quickProgress;
                    } else {
                        // 0.3-0.8秒: 70%から目標高さまでイージング
                        const remainingTime = this.elapsedTime - this.quickGrowthDuration;
                        const remainingDuration = this.initialPhaseDuration - this.quickGrowthDuration;
                        const easeProgress = remainingTime / remainingDuration;
                        this.accumulatedHeight = this.quickGrowthTarget + (this.targetHeight - this.quickGrowthTarget) * easeProgress;
                    }
                } else {
                    // 通常モード: 0.8秒かけて目標高さまでイージング
                    const progress = this.elapsedTime / this.initialPhaseDuration;
                    this.accumulatedHeight = this.targetHeight * progress;
                }

                // Phase 1終了時に最大レベルを決定
                if (this.elapsedTime >= this.initialPhaseDuration - (1 / 60)) {
                    this.determineMaxAllowedLevel(avgVolume);
                }
            }
            // Phase 2: 段階的延長成長（0.8秒以降）
            else {
                // 現在の音量に応じた成長速度を判定（最大レベル制限付き）
                let growthRate = 0;
                for (let i = Math.min(this.sustainedGrowthLevels.length - 1, this.maxAllowedLevel - 1); i >= 0; i--) {
                    if (this.volume >= this.sustainedGrowthLevels[i].threshold) {
                        growthRate = this.sustainedGrowthLevels[i].growthRate;
                        break;
                    }
                }

                // 成長を積み上げ（px/秒）
                this.accumulatedHeight += growthRate * (1 / 60);  // 60fps想定

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
     * v1.7.2: 初期音量に応じて使える最大レベルを決定（10段階）
     * @param avgVolume - 初期0.8秒間の平均音量
     */
    private determineMaxAllowedLevel(avgVolume: number): void {
        if (avgVolume < 0.06) {
            this.maxAllowedLevel = 2;  // Lv2まで
        } else if (avgVolume < 0.09) {
            this.maxAllowedLevel = 3;  // Lv3まで
        } else if (avgVolume < 0.11) {
            this.maxAllowedLevel = 4;  // Lv4まで
        } else if (avgVolume < 0.13) {
            this.maxAllowedLevel = 5;  // Lv5まで
        } else if (avgVolume < 0.15) {
            this.maxAllowedLevel = 6;  // Lv6まで
        } else if (avgVolume < 0.17) {
            this.maxAllowedLevel = 7;  // Lv7まで
        } else if (avgVolume < 0.19) {
            this.maxAllowedLevel = 8;  // Lv8まで
        } else if (avgVolume < 0.22) {
            this.maxAllowedLevel = 9;  // Lv9まで
        } else {
            this.maxAllowedLevel = 10; // Lv10まで（全開放）
        }
        console.log(`[PlantView] Initial avgVolume: ${avgVolume.toFixed(3)}, Max allowed level: ${this.maxAllowedLevel}`);
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
     * v1.7.1: 2フェーズシステムの変数もリセット
     * ChallengeModeViewから呼び出される
     */
    resetPlantHeight(): void {
        // cleared状態を保護
        if (this.plantState !== 'cleared') {
            this.smoothedVolume = 0;
            this.accumulatedHeight = 0;

            // v1.7.1: 2フェーズシステム変数リセット
            this.elapsedTime = 0;
            this.volumeSamples = [];
            this.targetHeight = 0;
            this.isQuickGrowth = false;
            this.maxAllowedLevel = 5;
            this.hasVoiceStarted = false;  // v1.7.3: 発声開始フラグリセット

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
     * v1.7.1: 2フェーズシステムの変数もリセット
     */
    reset(): void {
        this.plantState = 'growing';
        this.volume = 0;
        this.frequency = 0;
        this.smoothedVolume = 0;
        this.accumulatedHeight = 0;
        this.clearedHeight = 0;
        this.clearTriggered = false;

        // v1.7.1: 2フェーズシステム変数リセット
        this.elapsedTime = 0;
        this.volumeSamples = [];
        this.targetHeight = 0;
        this.isQuickGrowth = false;
        this.maxAllowedLevel = 5;
        this.hasVoiceStarted = false;  // v1.7.3: 発声開始フラグリセット

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
     * v1.7.2: 音量の微分で30-70%を行き来するように調整
     */
    setPreviewHeight(volume: number): void {
        // 音量を増幅（×10で高感度化）
        const amplifiedVolume = Math.min(volume * 10, 1.0);

        // スムージング
        this.smoothedVolume = this.smoothedVolume * (1 - this.smoothingFactor) + amplifiedVolume * this.smoothingFactor;

        // 30-70%の範囲にマッピング（120-280px）
        // smoothedVolume 0-1 → 30-70%
        const minHeight = 120;  // 30% of 400px
        const maxHeight = 280;  // 70% of 400px
        this.accumulatedHeight = minHeight + this.smoothedVolume * (maxHeight - minHeight);
    }
}

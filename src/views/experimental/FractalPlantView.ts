import p5 from 'p5';
import { AudioAnalyzer } from '../../audio';
import { IView, PlantState } from '../../types';
import { hslToRgb } from '../../utils';
import { drawGrowingTree } from './fractalAlgorithms';
import { ParticleSystem } from '../../effects/ParticleSystem';
import { ConcreteEffect } from '../../effects/ConcreteEffect';

/**
 * フラクタル植物ビュークラス（実験的、v1.0状態管理版）
 * 音量で根元から成長する対生の樹木
 * Clear!エフェクト統合
 * v1.0: Clear後は完成状態を維持、継続エフェクト表示
 */
export class FractalPlantView implements IView {
    private volume: number = 0;
    private frequencyLow: number = 0;
    private frequencyHigh: number = 0;
    private frequencyAverage: number = 0;
    private smoothedVolume: number = 0;
    private readonly smoothingFactor: number = 0.3;

    // 成長累積システム
    private accumulatedHeight: number = 0;
    private readonly growthSpeed: number = 3; // 成長速度
    private readonly decayRate: number = 0.98; // 減衰率

    // v1.0: 状態管理
    private plantState: PlantState = 'growing';
    private clearedAccumulatedHeight: number = 0;  // Clear時の累積高さを保存
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

        this.frequencyLow = frequencyData.low;
        this.frequencyHigh = frequencyData.high;
        this.frequencyAverage = frequencyData.average;

        // 音量をスムージング
        this.smoothedVolume = this.smoothedVolume * (1 - this.smoothingFactor) + this.volume * this.smoothingFactor;

        // v1.0: 状態別の処理
        if (this.plantState === 'growing') {
            // growing状態: 通常の成長処理
            // 音量累積で幹が成長（最大400px）
            this.accumulatedHeight += this.smoothedVolume * this.growthSpeed;
            this.accumulatedHeight = Math.min(this.accumulatedHeight, 400);

            // 静かになると少しずつ減衰
            if (this.smoothedVolume < 0.1) {
                this.accumulatedHeight *= this.decayRate;
            }

            // Clear!リトライ判定（音量が下がったら再挑戦可能）
            if (this.smoothedVolume < 0.3 && this.clearTriggered) {
                this.clearTriggered = false;
            }
        } else {
            // cleared状態: 累積高さ固定、継続エフェクトのみ
            this.accumulatedHeight = this.clearedAccumulatedHeight;
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
        this.clearedAccumulatedHeight = this.accumulatedHeight;  // 現在の累積高さを保存
        this.clearTriggered = true;
        this.triggerClear(this.calculateWallY(), this.calculateImpactX());
    }

    /**
     * v1.0: 壁のY座標を計算
     */
    private calculateWallY(): number {
        const baseY = this.concrete.getGroundY({ height: 600 } as p5);  // 仮のp5インスタンス
        return baseY - (this.clearThreshold * 400);
    }

    /**
     * v1.0: 衝突X座標を計算
     */
    private calculateImpactX(): number {
        return 400;  // 画面中央（仮）
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
        const baseY = this.concrete.getGroundY(p);
        const clearLineY = baseY - (this.clearThreshold * 400);
        const wallY = clearLineY;

        // コンクリート壁を描画（赤ライン位置に横向き）
        this.concrete.drawWall(p, wallY, 60, [120, 120, 120], 0.9);

        // v1.1.1: Clear!判定（accumulatedHeightベース、壁の位置に到達で判定）
        if (this.accumulatedHeight >= (this.clearThreshold * 400) && !this.clearTriggered && this.plantState === 'growing') {
            this.transitionToCleared();
        }

        // 音声パラメータをフラクタルパラメータにマッピング
        const trunkHeight = this.accumulatedHeight; // 幹の高さ
        const branchStartRatio = p.map(this.frequencyLow, 0, 1, 0.4, 0.8); // 分岐開始位置（40-80%）
        const branchAngle = p.map(this.frequencyHigh, 0, 1, 15, 45); // 分岐角度（15-45度）
        const maxDepth = Math.floor(p.map(trunkHeight, 0, 400, 1, 6)); // 高さで深度決定

        // 色: 周波数平均で緑→赤
        const hue = p.map(this.frequencyAverage, 0, 1, 120, 0);
        const [r, g, b] = hslToRgb(hue, 1.0, 0.5);

        // 対生の樹木を描画（画面下部から）
        const baseX = p.width / 2;
        const treeBaseY = p.height * 0.9;  // PlantViewと同じ基点

        drawGrowingTree(
            p,
            baseX,
            treeBaseY,
            trunkHeight,
            branchStartRatio,
            branchAngle,
            maxDepth,
            [r, g, b]
        );

        // コンクリートひび割れを描画
        this.concrete.drawCracks(p);

        // 粒子を描画
        this.particles.draw(p);
    }

    /**
     * Challenge Mode用: 植物の高さを0にリセット
     */
    resetPlantHeight(): void {
        if (this.plantState !== 'cleared') {
            this.accumulatedHeight = 0;
            this.smoothedVolume = 0;
            this.particles.clear();
            this.concrete = new ConcreteEffect();
        }
    }

    /**
     * Challenge Mode用: GameOver状態への遷移
     */
    transitionToGameOver(): void {
        if (this.plantState === 'cleared') {
            return;
        }
        this.plantState = 'gameOver';
    }

    /**
     * Challenge Mode用: リセット完了チェック
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
        this.frequencyLow = 0;
        this.frequencyHigh = 0;
        this.frequencyAverage = 0;
        this.smoothedVolume = 0;
        this.accumulatedHeight = 0;
        this.clearedAccumulatedHeight = 0;
        this.clearTriggered = false;

        this.particles = new ParticleSystem();
        this.concrete = new ConcreteEffect();
    }

    /**
     * Challenge Mode用: 残り時間取得（v1.0版ではタイマーなし）
     */
    getRemainingTime(): number | null {
        return null;
    }
}

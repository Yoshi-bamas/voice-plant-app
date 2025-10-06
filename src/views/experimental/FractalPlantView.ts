import p5 from 'p5';
import { AudioAnalyzer } from '../../audio';
import { IView } from '../../types';
import { hslToRgb } from '../../utils';
import { drawGrowingTree } from './fractalAlgorithms';
import { ParticleSystem } from '../../effects/ParticleSystem';
import { ConcreteEffect } from '../../effects/ConcreteEffect';

/**
 * フラクタル植物ビュークラス（実験的）
 * 音量で根元から成長する対生の樹木
 * Clear!エフェクト統合
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

        // 音量累積で幹が成長（最大400px）
        this.accumulatedHeight += this.smoothedVolume * this.growthSpeed;
        this.accumulatedHeight = Math.min(this.accumulatedHeight, 400);

        // 静かになると少しずつ減衰
        if (this.smoothedVolume < 0.1) {
            this.accumulatedHeight *= this.decayRate;
        }

        // Clear!判定（音量0.8以上）は draw() で実行（壁の位置計算後）

        // Clear!終了判定（音量が下がったらリセット）
        if (this.smoothedVolume < 0.5 && this.clearTriggered) {
            this.clearTriggered = false;
        }

        // エフェクト更新
        this.particles.update();
        this.concrete.update();
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
     * DOM操作: Clear!メッセージを表示
     */
    private showClearMessage(): void {
        const msg = document.getElementById('clearMessage');
        if (msg) {
            msg.classList.add('clear-message--visible');
            setTimeout(() => {
                msg.classList.remove('clear-message--visible');
            }, 2000);
        }
    }

    draw(p: p5): void {
        // Clear!ライン（壁）の位置を計算
        const baseY = this.concrete.getGroundY(p);
        const clearLineY = baseY - (0.8 * 400); // 0.8相当の高さ = 320px
        const wallY = clearLineY;

        // コンクリート壁を描画（赤ライン位置に横向き）
        this.concrete.drawWall(p, wallY, 60, [120, 120, 120], 0.9);

        // デバッグ用: 赤いライン（壁の中心線）
        p.stroke(255, 0, 0, 150);
        p.strokeWeight(2);
        p.line(0, clearLineY, p.width, clearLineY);

        // デバッグ表示（強化版）
        p.fill(255, 255, 255, 200);
        p.textSize(20);
        p.text('Fractal Plant (Experimental)', 10, 25);
        p.text(`Height: ${this.accumulatedHeight.toFixed(0)}px`, 10, 55);
        p.text(`Volume: ${this.smoothedVolume.toFixed(3)}`, 10, 85);
        p.text(`Clear: ${this.clearTriggered ? 'YES' : 'NO'}`, 10, 115);

        // Clear!判定（音量0.8以上、壁の位置を渡す）
        if (this.smoothedVolume > 0.8 && !this.clearTriggered) {
            const impactX = p.width / 2;  // 画面中央
            this.triggerClear(wallY, impactX);
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
}

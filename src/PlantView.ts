import p5 from 'p5';
import { AudioAnalyzer } from './audio';
import { IView } from './types';
import { drawStem } from './animation';
import { ParticleSystem } from './effects/ParticleSystem';
import { ConcreteEffect } from './effects/ConcreteEffect';

/**
 * 植物ビュークラス
 * 音量で茎が伸び、周波数で葉が分岐する植物を描画
 * Clear!エフェクト（粒子・コンクリート）統合
 */
export class PlantView implements IView {
    private volume: number = 0;
    private frequency: number = 0;
    private smoothedVolume: number = 0;
    private readonly smoothingFactor: number = 0.3;

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
        const baseY = p.height * 0.9;
        const clearLineY = baseY - (0.8 * 400); // 0.8 * 400px = 320px
        const wallY = clearLineY;

        // コンクリート壁を描画（赤ライン位置に横向き）
        this.concrete.drawWall(p, wallY, 60, [120, 120, 120], 0.9);

        // デバッグ用: 赤いライン（壁の中心線）
        p.stroke(255, 0, 0, 150);
        p.strokeWeight(2);
        p.line(0, clearLineY, p.width, clearLineY);

        // デバッグ表示: 音量と周波数と高さ
        p.fill(255, 0, 0);
        p.textSize(32);
        p.text(`Volume: ${this.smoothedVolume.toFixed(3)}`, 10, 40);

        p.fill(255, 255, 0);
        p.textSize(32);
        p.text(`Freq: ${this.frequency.toFixed(3)}`, 10, 80);

        // 茎の高さ表示
        const stemHeight = p.map(this.smoothedVolume, 0, 1, 0, 400);
        p.fill(0, 255, 0);
        p.textSize(32);
        p.text(`Height: ${stemHeight.toFixed(0)}px`, 10, 120);

        // Clear!状態表示
        p.fill(255, 255, 255);
        p.textSize(32);
        p.text(`Clear: ${this.clearTriggered ? 'YES' : 'NO'}`, 10, 160);

        // Clear!判定（音量0.8以上、壁の位置を渡す）
        if (this.smoothedVolume > 0.8 && !this.clearTriggered) {
            const impactX = p.width / 2;  // 画面中央
            this.triggerClear(wallY, impactX);
        }

        // 茎を描画（地面上部から）
        drawStem(p, this.smoothedVolume, this.frequency);

        // コンクリートひび割れを描画
        this.concrete.drawCracks(p);

        // 粒子を描画
        this.particles.draw(p);
    }
}
